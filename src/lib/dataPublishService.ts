import type { ForkRepository, PublishCallbacks, PublishError, PublishMode, PublishState } from "@/lib/types/resumePublish";
import docsTsxRaw from "@/pages/Docs.tsx?raw";
import legalTsxRaw from "@/pages/Legal.tsx?raw";
import viteConfigRaw from "../../vite.config.ts?raw";

const GITHUB_API = "https://api.github.com";
const UPSTREAM_OWNER = "carlosrichardgeraldine";
const UPSTREAM_REPO = "my-link-gallery";
const UPSTREAM_FULL_NAME = `${UPSTREAM_OWNER}/${UPSTREAM_REPO}`;
const DATA_PATH = "src/data/data.json";
const WORKFLOWS_DIR = ".github/workflows";

const SOURCE_SYNC_FILES: Array<{ path: string; content: string }> = [
  { path: "src/pages/Docs.tsx", content: docsTsxRaw },
  { path: "src/pages/Legal.tsx", content: legalTsxRaw },
  { path: "vite.config.ts", content: viteConfigRaw },
];

type GithubUser = { login: string };

type GithubRepo = {
  name: string;
  full_name: string;
  default_branch: string;
  owner: { login: string };
  parent?: { full_name?: string };
  fork?: boolean;
};

const mapRepository = (repo: GithubRepo): ForkRepository => ({
  owner: repo.owner.login,
  name: repo.name,
  defaultBranch: repo.default_branch,
  fullName: repo.full_name,
});

const toBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
};

const parseError = async (response: Response) => {
  let details = "";
  try {
    const data = (await response.json()) as { message?: string };
    details = data.message ?? "";
  } catch {
    details = "";
  }
  return details;
};

const createPublishError = (error: PublishError): never => {
  throw error;
};

const apiRequest = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${GITHUB_API}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    createPublishError({
      code: "network_or_cors",
      message: "GitHub API is unreachable from this browser session.",
      details: error instanceof Error ? error.message : "Unknown network error.",
    });
  }

  if (!response.ok) {
    const details = await parseError(response);
    if (response.status === 401) {
      createPublishError({
        code: "auth_failed",
        message: "Authentication failed. Check your GitHub token permissions.",
        details,
      });
    }
    createPublishError({
      code: "unexpected",
      message: "GitHub API request failed.",
      details,
    });
  }

  return (await response.json()) as T;
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

type ResolvedTarget = {
  repository: ForkRepository;
  mode: PublishMode;
};

export type DataPublishResult = {
  fork: ForkRepository;
  branch: string;
  commitUrl: string;
  publishMode: PublishMode;
  deploymentTriggered: boolean;
};

const findExistingTargetRepository = async (token: string, userLogin: string): Promise<ForkRepository | null> => {
  const directRepoPath = `/repos/${userLogin}/${UPSTREAM_REPO}`;
  try {
    const directRepo = await apiRequest<GithubRepo>(directRepoPath, token);
    if (directRepo.full_name === UPSTREAM_FULL_NAME) return mapRepository(directRepo);
    if (directRepo.fork && directRepo.parent?.full_name === UPSTREAM_FULL_NAME) return mapRepository(directRepo);
  } catch {
    // Continue to repo search if the direct path is missing.
  }
  const repositories = await apiRequest<GithubRepo[]>("/user/repos?per_page=100&affiliation=owner", token);
  const matchedFork = repositories.find((repo) => repo.fork && repo.parent?.full_name === UPSTREAM_FULL_NAME);
  if (!matchedFork) return null;
  return mapRepository(matchedFork);
};

const createForkAndResolve = async (token: string, userLogin: string): Promise<ResolvedTarget> => {
  try {
    await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/forks`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_branch_only: true }),
    });
  } catch (error) {
    const publishError = error as PublishError;
    const details = (publishError.details ?? "").toLowerCase();
    if (userLogin === UPSTREAM_OWNER || details.includes("cannot fork") || details.includes("own repository")) {
      const upstream = await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`, token);
      return { repository: mapRepository(upstream), mode: "owner_mode_upstream" };
    }
    createPublishError({
      code: "fork_create_failed",
      message: "Unable to create a fork for this account.",
      details: publishError.details,
    });
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const resolved = await findExistingTargetRepository(token, userLogin);
    if (resolved) return { repository: resolved, mode: "created_new_fork" };
    await wait(1200);
  }

  createPublishError({
    code: "fork_create_failed",
    message: "Fork creation did not complete in time.",
    details: "Please retry publish in a few seconds.",
  });
};

const resolveTargetRepository = async (token: string): Promise<ResolvedTarget> => {
  const user = await apiRequest<GithubUser>("/user", token);
  const existingTarget = await findExistingTargetRepository(token, user.login);
  if (existingTarget) {
    return {
      repository: existingTarget,
      mode: existingTarget.fullName === UPSTREAM_FULL_NAME ? "owner_mode_upstream" : "used_existing_fork",
    };
  }
  if (user.login === UPSTREAM_OWNER) {
    const upstream = await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`, token);
    return { repository: mapRepository(upstream), mode: "owner_mode_upstream" };
  }
  return createForkAndResolve(token, user.login);
};

type WorkflowFile = { path: string; sha: string; type: string };

const getWorkflowFilePaths = async (repo: ForkRepository, token: string, branch: string): Promise<string[]> => {
  try {
    const result = await apiRequest<WorkflowFile[]>(
      `/repos/${repo.owner}/${repo.name}/contents/${WORKFLOWS_DIR}?ref=${encodeURIComponent(branch)}`,
      token
    );
    if (!Array.isArray(result)) return [];
    return result.filter((f) => f.type === "file").map((f) => f.path);
  } catch {
    return [];
  }
};

type TreeItem =
  | { path: string; mode: "100644"; type: "blob"; sha: string }
  | { path: string; mode: "100644"; type: "blob"; sha: null };

const commitDataWithCleanup = async (
  repo: ForkRepository,
  token: string,
  branch: string,
  dataSource: string
): Promise<string> => {
  try {
    const base = `/repos/${repo.owner}/${repo.name}`;

    const branchInfo = await apiRequest<{
      commit: { sha: string; commit: { tree: { sha: string } } };
    }>(`${base}/branches/${encodeURIComponent(branch)}`, token);

    const baseCommitSha = branchInfo.commit.sha;
    const baseTreeSha = branchInfo.commit.commit.tree.sha;

    const createBlob = (content: string) =>
      apiRequest<{ sha: string }>(`${base}/git/blobs`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: toBase64(content), encoding: "base64" }),
      });

    const [dataBlob, ...rest] = await Promise.all([
      createBlob(dataSource),
      ...SOURCE_SYNC_FILES.map((f) => createBlob(f.content)),
      getWorkflowFilePaths(repo, token, branch),
    ]);

    const sourceSyncBlobs = rest.slice(0, SOURCE_SYNC_FILES.length) as Array<{ sha: string }>;
    const workflowPaths = rest[SOURCE_SYNC_FILES.length] as string[];

    const treeItems: TreeItem[] = [
      { path: DATA_PATH, mode: "100644", type: "blob", sha: dataBlob.sha },
      ...SOURCE_SYNC_FILES.map((f, i): TreeItem => ({
        path: f.path,
        mode: "100644",
        type: "blob",
        sha: sourceSyncBlobs[i].sha,
      })),
      ...workflowPaths.map((p): TreeItem => ({ path: p, mode: "100644", type: "blob", sha: null })),
    ];

    const newTree = await apiRequest<{ sha: string }>(`${base}/git/trees`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });

    const commitMessage =
      workflowPaths.length > 0
        ? "chore: update data.json, sync source fixes, and remove CI workflows"
        : "chore: update data.json and sync source fixes from builder";

    const newCommit = await apiRequest<{ sha: string; html_url: string }>(
      `${base}/git/commits`,
      token,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: commitMessage,
          tree: newTree.sha,
          parents: [baseCommitSha],
        }),
      }
    );

    await apiRequest(`${base}/git/refs/heads/${encodeURIComponent(branch)}`, token, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });

    return newCommit.html_url;
  } catch (error) {
    if ((error as PublishError).code === "unexpected") {
      createPublishError({
        code: "commit_failed",
        message: "Unable to commit data.json in the target repository.",
        details: (error as PublishError).details,
      });
    }
    throw error;
  }
};

const notifyState = (callbacks: PublishCallbacks | undefined, state: PublishState) => {
  callbacks?.onStateChange?.(state);
};

export const publishDataToFork = async (
  token: string,
  dataSource: string,
  callbacks?: PublishCallbacks
): Promise<DataPublishResult> => {
  notifyState(callbacks, "validating");

  notifyState(callbacks, "preparing");
  const target = await resolveTargetRepository(token);
  const repo = target.repository;
  const branch = repo.defaultBranch;

  notifyState(callbacks, "committing");
  const commitUrl = await commitDataWithCleanup(repo, token, branch, dataSource);

  notifyState(callbacks, "success");

  return {
    fork: repo,
    branch,
    commitUrl,
    publishMode: target.mode,
    deploymentTriggered: true,
  };
};
