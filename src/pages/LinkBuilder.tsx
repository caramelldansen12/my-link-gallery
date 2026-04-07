import { Download, Redo2, RotateCcw, Send, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LinkItemsEditor from "@/components/link-builder/LinkItemsEditor";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createLinkBuilderContent, type LinkBuilderContent } from "@/data/linkBuilderContent";
import { useLinkPublish } from "@/hooks/useLinkPublish";
import { useHistoryState } from "@/hooks/useHistoryState";
import { buildLinksTs, downloadLinksTs, parseLinkBuilderContentFromSource } from "@/lib/linkBuilderGenerator";
import linksCurrentSource from "@/data/links.ts?raw";
import { toast } from "sonner";

const publishModeLabels: Record<"used_existing_fork" | "created_new_fork" | "owner_mode_upstream", string> = {
  used_existing_fork: "used existing fork",
  created_new_fork: "created new fork",
  owner_mode_upstream: "owner mode (upstream)",
};

const LinkBuilder = () => {
  const {
    value: content,
    setWithHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistoryState<LinkBuilderContent>(() => {
    const parsed = parseLinkBuilderContentFromSource(linksCurrentSource);
    return parsed ?? createLinkBuilderContent();
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isGeneratedNotesOpen, setIsGeneratedNotesOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishToken, setPublishToken] = useState("");
  const contentRef = useRef(content);
  const {
    state: publishState,
    error: publishError,
    result: publishResult,
    statusLabel: publishStatusLabel,
    publish,
    reset: resetPublish,
  } = useLinkPublish();

  const isPublishing =
    publishState === "validating" ||
    publishState === "preparing" ||
    publishState === "committing";

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const updateContent = (updater: (current: LinkBuilderContent) => LinkBuilderContent) => {
    setWithHistory((current) => {
      const nextContent = updater(current);
      contentRef.current = nextContent;
      return nextContent;
    });
  };

  const handleGenerate = () => {
    downloadLinksTs(contentRef.current);
    setIsGeneratedNotesOpen(true);
    toast.success("links.ts downloaded.");
  };

  const handleReset = () => {
    reset(createLinkBuilderContent());
    toast.success("Builder reset to the current links.ts defaults.");
  };

  const handlePublish = async () => {
    const token = publishToken.trim();

    if (!token) {
      toast.error("Enter a GitHub token before publishing.");
      return;
    }

    const generatedSource = buildLinksTs(contentRef.current);
    const outcome = await publish(token, generatedSource);

    setPublishToken("");

    if (outcome) {
      toast.success("Publish completed and PR is ready.");
    } else {
      toast.error("Publish failed. Review details in the dialog.");
    }
  };

  const handlePublishDialogChange = (open: boolean) => {
    setIsPublishOpen(open);

    if (!open) {
      setPublishToken("");
      resetPublish();
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <h1 className="text-base font-semibold text-foreground md:text-xl">Links.ts Builder (beta)</h1>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Undo changes"
                title="Undo changes"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Redo changes"
                title="Redo changes"
              >
                <Redo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:opacity-90 md:text-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Generate
              </button>
              <button
                type="button"
                onClick={() => setIsPublishOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
              >
                <Send className="h-3.5 w-3.5" />
                Publish
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto grid h-[calc(100vh-3rem)] min-h-0 flex-1 gap-6 overflow-hidden px-4 py-6 md:h-[calc(100vh-3.5rem)] lg:grid-cols-[18rem_minmax(0,1fr)] lg:py-8">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sections</p>

            <nav className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => undefined}
                className="w-full rounded-2xl border border-foreground bg-foreground px-4 py-3 text-left text-background transition-colors"
              >
                <div className="text-sm font-semibold">Links</div>
                <div className="mt-1 text-xs leading-relaxed text-background/80">Full CRUD and reorder for all link cards.</div>
              </button>
            </nav>
          </aside>

          <div className="min-w-0 overflow-y-auto pr-1">
            <LinkItemsEditor links={content.links} onChange={(next) => updateContent((current) => ({ ...current, links: next }))} />
          </div>
        </main>
      </div>

      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Link Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your own links page.</DialogDescription>
          </DialogHeader>

          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li>Edit your links content in this builder.</li>
            <li>Use Generate to download links.ts for manual workflows.</li>
            <li>Use Publish to send generated links.ts to GitHub directly.</li>
            <li>Publish auto-detects your fork, creates one if needed, or uses upstream owner mode.</li>
            <li>Publish commits directly to the deployment branch and triggers CI/CD immediately.</li>
          </ol>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPublishOpen} onOpenChange={handlePublishDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish links.ts to GitHub</DialogTitle>
            <DialogDescription>
              This flow uses your fork when available, creates one automatically when needed, and falls back to the
              existing repository when the token belongs to the upstream owner. It commits directly to the deployment
              branch so CI/CD starts immediately without a merge step. The token is used in-memory only and cleared
              when this dialog closes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">GitHub personal access token</span>
              <Input
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={publishToken}
                onChange={(event) => setPublishToken(event.target.value)}
                placeholder="ghp_..."
                disabled={isPublishing}
              />
            </label>

            {publishStatusLabel ? <p className="text-sm text-muted-foreground">{publishStatusLabel}</p> : null}

            {publishError ? (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground">
                <p className="font-medium">{publishError.message}</p>
                {publishError.details ? <p className="mt-1 text-muted-foreground">{publishError.details}</p> : null}
                {publishError.code === "network_or_cors" ? (
                  <p className="mt-2 text-muted-foreground">
                    Fallback: use Generate to download links.ts, commit it to your fork manually, then open a pull request.
                  </p>
                ) : null}
              </div>
            ) : null}

            {publishResult ? (
              <div className="rounded-2xl border border-border/70 bg-background p-3 text-sm">
                <p className="font-medium text-foreground">Publish complete</p>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                    {publishModeLabels[publishResult.publishMode]}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">Fork: {publishResult.fork.fullName}</p>
                <p className="mt-1 text-muted-foreground">Branch: {publishResult.branch}</p>
                <p className="mt-1 text-muted-foreground">
                  Deployment has been triggered automatically from this publish.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={publishResult.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
                  >
                    View commit
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handlePublishDialogChange(false)}
              disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-2xl border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? "Publishing..." : "Publish to GitHub"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGeneratedNotesOpen} onOpenChange={setIsGeneratedNotesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generated links.ts downloaded</DialogTitle>
            <DialogDescription>
              Replace your source links data file manually after reviewing the download.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsGeneratedNotesOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkBuilder;
