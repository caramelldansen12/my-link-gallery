import { Download, GripVertical, Plus, Redo2, RotateCcw, Trash2, Undo2 } from "lucide-react";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
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
import { createLinkBuilderContent, type LinkBuilderContent } from "@/data/linkBuilderContent";
import { downloadLinksTs, parseLinkBuilderContentFromSource } from "@/lib/linkBuilderGenerator";
import linksCurrentSource from "@/data/links.ts?raw";
import { toast } from "sonner";

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item);

const joinLines = (items: string[]) => items.join("\n");

const classNames = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

const createBlankLink = (index: number) => ({
  id: `new-link-${index + 1}`,
  title: "",
  description: "",
  url: "",
  tags: [],
});

const updateLink = (
  links: LinkBuilderContent["links"],
  index: number,
  patch: Partial<LinkBuilderContent["links"][number]>
) => links.map((link, linkIndex) => (linkIndex === index ? { ...link, ...patch } : link));

const reorderArray = <T,>(items: T[], sourceIndex: number, targetIndex: number): T[] => {
  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);

  if (moved === undefined) {
    return items;
  }

  next.splice(targetIndex, 0, moved);
  return next;
};

const LinkItemsEditor = ({
  links,
  onChange,
}: {
  links: LinkBuilderContent["links"];
  onChange: (next: LinkBuilderContent["links"]) => void;
}) => {
  const [dragState, setDragState] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: "before" | "after" } | null>(null);

  const handleDragOverCard = (event: DragEvent<HTMLElement>, index: number) => {
    event.preventDefault();

    if (dragState === null) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: "before" | "after" = event.clientY < midpoint ? "before" : "after";

    setDropTarget({ index, position });
    event.dataTransfer.dropEffect = "move";
  };

  const handleDropCard = (event: DragEvent<HTMLElement>, targetIndex: number) => {
    event.preventDefault();

    if (dragState === null) {
      setDropTarget(null);
      return;
    }

    const position = dropTarget?.index === targetIndex ? dropTarget.position : "before";
    let nextIndex = position === "before" ? targetIndex : targetIndex + 1;

    if (dragState < nextIndex) {
      nextIndex -= 1;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    if (nextIndex > links.length - 1) {
      nextIndex = links.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(links, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Links</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, reorder, and delete links with full field control.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...links, createBlankLink(links.length)])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add link
        </button>
      </div>
      {links.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-2">
          {links.map((item, index) => (
            <AccordionItem
              key={`link-item-${index}`}
              value={`link-${index}`}
              className="relative rounded-2xl border border-border/70 bg-background/90 px-4"
              onDragOver={(event) => handleDragOverCard(event, index)}
              onDrop={(event) => handleDropCard(event, index)}
            >
              {dropTarget?.index === index && dropTarget.position === "before" ? (
                <div className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
              {dropTarget?.index === index && dropTarget.position === "after" ? (
                <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
              ) : null}

              <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                <div className="flex min-w-0 items-center gap-1.5 text-left">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDragState(index)}
                    onDragEnd={() => {
                      setDropTarget(null);
                      setDragState(null);
                    }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                    aria-label="Drag to reorder link"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">{item.title || "Untitled link"}</h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{item.url || "No URL"}</p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex items-start justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => onChange(links.filter((_, itemIndex) => itemIndex !== index))}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-foreground">Title</span>
                      <input
                        value={item.title}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          onChange(updateLink(links, index, { title: event.target.value }))
                        }
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-foreground">Description</span>
                      <textarea
                        value={item.description}
                        onChange={(event) => onChange(updateLink(links, index, { description: event.target.value }))}
                        rows={3}
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-foreground">URL</span>
                      <input
                        value={item.url}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          onChange(updateLink(links, index, { url: event.target.value }))
                        }
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-foreground">Tags</span>
                      <textarea
                        value={joinLines(item.tags)}
                        onChange={(event) => onChange(updateLink(links, index, { tags: splitLines(event.target.value) }))}
                        rows={4}
                        placeholder="One tag per line"
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                      />
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No links yet. Add a link to begin.
        </div>
      )}
    </section>
  );
};

const LinkBuilder = () => {
  const [content, setContent] = useState<LinkBuilderContent>(() => {
    const parsed = parseLinkBuilderContentFromSource(linksCurrentSource);
    return parsed ?? createLinkBuilderContent();
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isGeneratedNotesOpen, setIsGeneratedNotesOpen] = useState(false);
  const [, setHistoryTick] = useState(0);
  const contentRef = useRef(content);
  const undoStackRef = useRef<LinkBuilderContent[]>([]);
  const redoStackRef = useRef<LinkBuilderContent[]>([]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const updateContent = (updater: (current: LinkBuilderContent) => LinkBuilderContent) => {
    setContent((current) => {
      const nextContent = updater(current);
      contentRef.current = nextContent;
      undoStackRef.current.push(current);
      redoStackRef.current = [];
      return nextContent;
    });
    setHistoryTick((current) => current + 1);
  };

  const handleUndo = () => {
    setContent((current) => {
      const previous = undoStackRef.current.pop();

      if (!previous) {
        return current;
      }

      redoStackRef.current.push(current);
      return previous;
    });
    setHistoryTick((current) => current + 1);
  };

  const handleRedo = () => {
    setContent((current) => {
      const next = redoStackRef.current.pop();

      if (!next) {
        return current;
      }

      undoStackRef.current.push(current);
      return next;
    });
    setHistoryTick((current) => current + 1);
  };

  const handleGenerate = () => {
    downloadLinksTs(contentRef.current);
    setIsGeneratedNotesOpen(true);
    toast.success("links.ts downloaded.");
  };

  const handleReset = () => {
    updateContent(() => createLinkBuilderContent());
    toast.success("Builder reset to the current links.ts defaults.");
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
                onClick={handleUndo}
                disabled={undoStackRef.current.length === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Undo changes"
                title="Undo changes"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStackRef.current.length === 0}
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
                className={classNames(
                  "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
                  "border-foreground bg-foreground text-background"
                )}
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
            <li>Clone the git repo.</li>
            <li>Customize the links.ts file.</li>
            <li>Locate and replace the links.ts file in your project.</li>
            <li>Run the web app locally.</li>
            <li>Or deploy it to static web app hosting.</li>
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
