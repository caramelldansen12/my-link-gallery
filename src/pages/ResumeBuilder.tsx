import { ChevronDown, Download, Redo2, RotateCcw, Send, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createResumeBuilderContent,
  type ResumeBuilderContent,
} from "@/data/resumeBuilderContent";
import { BuilderPanel } from "@/features/resume-builder/BuilderPanel";
import { sections, type SectionId } from "@/features/resume-builder/config";
import { useHistoryState } from "@/hooks/useHistoryState";
import { useResumePublish } from "@/hooks/useResumePublish";
import { buildResumeDataJson, downloadResumeDataJson } from "@/lib/resumeBuilderGenerator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const classNames = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

const publishModeLabels: Record<"used_existing_fork" | "created_new_fork" | "owner_mode_upstream", string> = {
  used_existing_fork: "used existing fork",
  created_new_fork: "created new fork",
  owner_mode_upstream: "owner mode (upstream)",
};

const ResumeBuilder = () => {
  const {
    value: content,
    setWithHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistoryState<ResumeBuilderContent>(() => createResumeBuilderContent());
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("resumePages");
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [isSectionsExpanded, setIsSectionsExpanded] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishToken, setPublishToken] = useState("");
  const [builderStatusHeight, setBuilderStatusHeight] = useState(0);
  const builderStatusRef = useRef<HTMLElement | null>(null);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);
  const {
    state: publishState,
    error: publishError,
    result: publishResult,
    statusLabel: publishStatusLabel,
    publish,
    reset: resetPublish,
  } = useResumePublish();

  const isPublishing =
    publishState === "validating" ||
    publishState === "preparing" ||
    publishState === "committing";

  useEffect(() => {
    const element = builderStatusRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      setBuilderStatusHeight(element.offsetHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isStatusExpanded]);

  const updateContent = (nextContent: ResumeBuilderContent) => {
    setWithHistory(nextContent);
  };

  const handleReset = () => {
    reset(createResumeBuilderContent());
    setActiveSection("resumePages");
    toast.success("Builder reset to the current defaults.")
  };

  const handleGenerate = () => {
    downloadResumeDataJson(content);
    setIsNotesOpen(true);
    toast.success("resume-data.json downloaded.");
  };

  const handlePublish = async () => {
    const token = publishToken.trim();

    if (!token) {
      toast.error("Enter a GitHub token before publishing.");
      return;
    }

    const generatedSource = buildResumeDataJson(content);
    const outcome = await publish(token, generatedSource);

    setPublishToken("");

    if (outcome) {
      toast.success("Publish completed and deployment started.");
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

  const sectionButtons = sections.map((section) => {
    const active = activeSection === section.id;

    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setActiveSection(section.id)}
        className={classNames(
          "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-foreground hover:bg-muted/40"
        )}
      >
        <div className="text-sm font-semibold">{section.label}</div>
        <div className={classNames("mt-1 text-xs leading-relaxed", active ? "text-background/80" : "text-muted-foreground")}>
          {section.description}
        </div>
      </button>
    );
  });

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10 flex h-screen flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <h1 className="text-base font-semibold text-foreground md:text-xl">Resume.tsx Builder (beta)</h1>

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

        <main className="container mx-auto grid h-[calc(100vh-3rem)] min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden px-4 py-6 md:h-[calc(100vh-3.5rem)] lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-1 lg:py-8">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm max-h-[38vh] overflow-hidden lg:h-full lg:max-h-none">
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sections</p>
                <button
                  type="button"
                  onClick={() => setIsSectionsExpanded((current) => !current)}
                  className="inline-flex items-center text-foreground transition-colors hover:opacity-80 lg:hidden"
                  aria-expanded={isSectionsExpanded}
                  aria-label="Toggle sections"
                >
                  <ChevronDown
                    className={classNames(
                      "h-4 w-4 transition-transform duration-200",
                      isSectionsExpanded ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>
              </div>

              <nav className="mt-4 hidden flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 lg:block">{sectionButtons}</nav>

              {isSectionsExpanded ? (
                <nav className="mt-4 flex-1 min-h-0 space-y-2 overflow-y-auto pr-1 lg:hidden">{sectionButtons}</nav>
              ) : null}
            </div>
          </aside>

          <div className="relative min-w-0 h-full">
            <section ref={builderStatusRef} className="absolute inset-x-0 top-0 z-20 rounded-3xl border border-border bg-card/95 p-5 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setIsStatusExpanded((current) => !current)}
                className="flex w-full items-center justify-between text-left"
                aria-expanded={isStatusExpanded}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Builder status</p>
                <ChevronDown
                  className={classNames(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isStatusExpanded ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {isStatusExpanded ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Editable pages</div>
                    <div className="mt-1 text-2xl font-bold">{content.resumePages.length}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Projects</div>
                    <div className="mt-1 text-2xl font-bold">{content.projectItems.length}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="text-sm text-muted-foreground">Credentials</div>
                    <div className="mt-1 text-2xl font-bold">{content.highlightedCredentials.length}</div>
                  </div>
                </div>
              ) : null}
            </section>

            <div ref={editorScrollRef} className="h-full overflow-y-auto pr-1 space-y-6" style={{ paddingTop: `${builderStatusHeight + 24}px` }}>
              <BuilderPanel activeSection={activeSection} content={content} setContent={updateContent} />

            </div>
          </div>
        </main>
      </div>

      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generated resume-data.json downloaded</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              The Generate button downloads a <span className="font-medium text-foreground">resume-data.json</span> file.
              It does not write to the workspace or commit anything.
            </p>
            <p>Replace <span className="font-medium text-foreground">src/data/resume-data.json</span> with this file to apply your changes.</p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsNotesOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPublishOpen} onOpenChange={handlePublishDialogChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publish resume-data.json to GitHub</DialogTitle>
            <DialogDescription>
              This flow uses your fork when available, creates one automatically when needed, and falls back to the
              existing repository when the token belongs to the upstream owner. It commits <span className="font-medium">resume-data.json</span> directly to the deployment
              branch so CI/CD starts immediately without a merge step.
              The token is used in-memory only and cleared when this dialog closes.
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
                    Fallback: use Generate to download resume-data.json, replace src/data/resume-data.json in your fork manually, then open a pull request.
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

      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Resume Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your resume page.</DialogDescription>
          </DialogHeader>

          <ol className="space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 list-decimal">
            <li>Edit your resume content in this builder.</li>
            <li>Use Generate to download <strong>resume-data.json</strong> and replace <code>src/data/resume-data.json</code> in your project.</li>
            <li>Use Publish to send the updated resume-data.json to GitHub directly.</li>
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
    </div>
  );
};

export default ResumeBuilder;
