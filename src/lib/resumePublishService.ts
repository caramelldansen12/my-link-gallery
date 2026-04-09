import type { ForkRepository, PublishCallbacks, PublishError, PublishMode, PublishState } from "@/lib/types/resumePublish";

const GITHUB_API = "https://api.github.com";
const UPSTREAM_OWNER = "carlosrichardgeraldine";
const UPSTREAM_REPO = "my-link-gallery";
const UPSTREAM_FULL_NAME = `${UPSTREAM_OWNER}/${UPSTREAM_REPO}`;
const RESUME_PATH = "src/data/resume-data.json";

type GithubUser = {
  login: string;
};

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

type WorkflowFile = { path: string; sha: string; type: string };

const deleteWorkflowsFromFork = async (fork: ForkRepository, token: string, branch: string): Promise<void> => {
  let files: WorkflowFile[] = [];

  try {
    const result = await apiRequest<WorkflowFile[]>(
      `/repos/${fork.owner}/${fork.name}/contents/.github/workflows?ref=${encodeURIComponent(branch)}`,
      token
    );
    if (Array.isArray(result)) files = result;
  } catch {
    return;
  }

  await Promise.allSettled(
    files
      .filter((f) => f.type === "file")
      .map((file) =>
        apiRequest(`/repos/${fork.owner}/${fork.name}/contents/${file.path}`, token, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "chore: remove default CI workflows (deploy using your own static hosting)",
            sha: file.sha,
            branch,
          }),
        }).catch(() => {})
      )
  );
};

type ResolvedTarget = {
  repository: ForkRepository;
  mode: PublishMode;
};

export type ResumePublishResult = {
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

    if (directRepo.full_name === UPSTREAM_FULL_NAME) {
      return mapRepository(directRepo);
    }

    if (directRepo.fork && directRepo.parent?.full_name === UPSTREAM_FULL_NAME) {
      return mapRepository(directRepo);
    }
  } catch {
    // Continue to repo search if the direct path is missing.
  }

  const repositories = await apiRequest<GithubRepo[]>("/user/repos?per_page=100&affiliation=owner", token);

  const matchedFork = repositories.find((repo) => repo.fork && repo.parent?.full_name === UPSTREAM_FULL_NAME);

  if (!matchedFork) {
    return null;
  }

  return mapRepository(matchedFork);
};

const createForkAndResolve = async (token: string, userLogin: string): Promise<ResolvedTarget> => {
  try {
    await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/forks`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_branch_only: true,
      }),
    });
  } catch (error) {
    const publishError = error as PublishError;
    const details = (publishError.details ?? "").toLowerCase();

    if (userLogin === UPSTREAM_OWNER || details.includes("cannot fork") || details.includes("own repository")) {
      const upstream = await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`, token);
      return {
        repository: mapRepository(upstream),
        mode: "owner_mode_upstream",
      };
    }

    createPublishError({
      code: "fork_create_failed",
      message: "Unable to create a fork for this account.",
      details: publishError.details,
    });
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const resolved = await findExistingTargetRepository(token, userLogin);

    if (resolved) {
      await deleteWorkflowsFromFork(resolved, token, resolved.defaultBranch);
      return {
        repository: resolved,
        mode: "created_new_fork",
      };
    }

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
    return {
      repository: mapRepository(upstream),
      mode: "owner_mode_upstream",
    };
  }

  return createForkAndResolve(token, user.login);
};

const commitResumeFile = async (fork: ForkRepository, token: string, branch: string, resumeSource: string) => {
  const contentPath = `/repos/${fork.owner}/${fork.name}/contents/${RESUME_PATH}?ref=${encodeURIComponent(branch)}`;
  const existing = await apiRequest<{ sha: string }>(contentPath, token);

  try {
    const updatePath = `/repos/${fork.owner}/${fork.name}/contents/${RESUME_PATH}`;

    const response = await apiRequest<{ content: { html_url: string } }>(updatePath, token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "chore: update resume-data.json from builder",
        content: toBase64(resumeSource),
        branch,
        sha: existing.sha,
      }),
    });

    return response.content.html_url;
  } catch (error) {
    if ((error as PublishError).code === "unexpected") {
      createPublishError({
        code: "commit_failed",
        message: "Unable to commit resume-data.json in the target repository.",
        details: (error as PublishError).details,
      });
    }

    throw error;
  }
};

const notifyState = (callbacks: PublishCallbacks | undefined, state: PublishState) => {
  callbacks?.onStateChange?.(state);
};

export const publishResumeToFork = async (
  token: string,
  resumeSource: string,
  callbacks?: PublishCallbacks
): Promise<ResumePublishResult> => {
  notifyState(callbacks, "validating");

  notifyState(callbacks, "preparing");
  const target = await resolveTargetRepository(token);
  const fork = target.repository;
  const branch = fork.defaultBranch;

  notifyState(callbacks, "committing");
  const commitUrl = await commitResumeFile(fork, token, branch, resumeSource);

  notifyState(callbacks, "success");

  return {
    fork,
    branch,
    commitUrl,
    publishMode: target.mode,
    deploymentTriggered: true,
  };
};
