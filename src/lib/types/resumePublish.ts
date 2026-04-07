export type PublishState =
  | "idle"
  | "validating"
  | "preparing"
  | "committing"
  | "creating_pr"
  | "success"
  | "error";

export type PublishErrorCode =
  | "auth_failed"
  | "fork_not_found"
  | "fork_create_failed"
  | "branch_create_failed"
  | "commit_failed"
  | "pr_failed"
  | "network_or_cors"
  | "unexpected";

export type PublishError = {
  code: PublishErrorCode;
  message: string;
  details?: string;
};

export type ForkRepository = {
  owner: string;
  name: string;
  defaultBranch: string;
  fullName: string;
};

export type PublishMode = "used_existing_fork" | "created_new_fork" | "owner_mode_upstream";

export type PublishResult = {
  fork: ForkRepository;
  branch: string;
  commitUrl: string;
  publishMode: PublishMode;
  deploymentTriggered: boolean;
};

export type PublishCallbacks = {
  onStateChange?: (state: PublishState) => void;
};
