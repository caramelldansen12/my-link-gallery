import { useMemo, useState } from "react";
import { publishDataToFork, type DataPublishResult } from "@/lib/dataPublishService";
import type { PublishError, PublishState } from "@/lib/types/resumePublish";

type UseDataPublishReturn = {
  state: PublishState;
  error: PublishError | null;
  result: DataPublishResult | null;
  statusLabel: string;
  publish: (token: string, dataSource: string) => Promise<DataPublishResult | null>;
  reset: () => void;
};

const statusLabels: Record<PublishState, string> = {
  idle: "",
  validating: "Validating token and account access...",
  preparing: "Preparing target repository...",
  committing: "Committing data.json to the deployment branch...",
  creating_pr: "",
  success: "Publish completed.",
  error: "Publish failed.",
};

export const useDataPublish = (): UseDataPublishReturn => {
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState<PublishError | null>(null);
  const [result, setResult] = useState<DataPublishResult | null>(null);

  const reset = () => {
    setState("idle");
    setError(null);
    setResult(null);
  };

  const publish = async (token: string, dataSource: string) => {
    setState("validating");
    setError(null);
    setResult(null);

    try {
      const publishResult = await publishDataToFork(token, dataSource, {
        onStateChange: setState,
      });
      setResult(publishResult);
      return publishResult;
    } catch (caughtError) {
      const publishError: PublishError =
        caughtError && typeof caughtError === "object" && "code" in caughtError && "message" in caughtError
          ? (caughtError as PublishError)
          : { code: "unexpected", message: "Unexpected publish error." };

      setState("error");
      setError(publishError);
      return null;
    }
  };

  const statusLabel = useMemo(() => statusLabels[state], [state]);

  return { state, error, result, statusLabel, publish, reset };
};
