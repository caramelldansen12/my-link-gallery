import { useMemo, useState } from "react";
import { publishLinksToFork, type LinkPublishResult } from "@/lib/linkPublishService";
import type { PublishError, PublishState } from "@/lib/types/resumePublish";

type UseLinkPublishReturn = {
  state: PublishState;
  error: PublishError | null;
  result: LinkPublishResult | null;
  statusLabel: string;
  publish: (token: string, linksSource: string) => Promise<LinkPublishResult | null>;
  reset: () => void;
};

const statusLabels: Record<PublishState, string> = {
  idle: "",
  validating: "Validating token and account access...",
  preparing: "Preparing a branch in your fork...",
  committing: "Committing links-data.json to the deployment branch...",
  creating_pr: "",
  success: "Publish completed.",
  error: "Publish failed.",
};

export const useLinkPublish = (): UseLinkPublishReturn => {
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState<PublishError | null>(null);
  const [result, setResult] = useState<LinkPublishResult | null>(null);

  const reset = () => {
    setState("idle");
    setError(null);
    setResult(null);
  };

  const publish = async (token: string, linksSource: string) => {
    setState("validating");
    setError(null);
    setResult(null);

    try {
      const publishResult = await publishLinksToFork(token, linksSource, {
        onStateChange: setState,
      });

      setResult(publishResult);
      return publishResult;
    } catch (caughtError) {
      const publishError: PublishError =
        caughtError && typeof caughtError === "object" && "code" in caughtError && "message" in caughtError
          ? (caughtError as PublishError)
          : {
              code: "unexpected",
              message: "Unexpected publish error.",
            };

      setState("error");
      setError(publishError);
      return null;
    }
  };

  const statusLabel = useMemo(() => statusLabels[state], [state]);

  return {
    state,
    error,
    result,
    statusLabel,
    publish,
    reset,
  };
};
