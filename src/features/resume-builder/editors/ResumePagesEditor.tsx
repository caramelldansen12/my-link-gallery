import { type DragEvent, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { OverviewDetailItem, ResumePageContent } from "@/data/resumeBuilderContent";
import { KeywordRowsEditor } from "@/features/resume-builder/editors/KeywordRowsEditor";

type ResumePagesEditorProps = {
  items: ResumePageContent[];
  onChange: (next: ResumePageContent[]) => void;
  overviewDetails: OverviewDetailItem[];
  onOverviewDetailsChange: (next: OverviewDetailItem[]) => void;
  rollingKeywordRows: string[][];
  onRollingKeywordRowsChange: (next: string[][]) => void;
};

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item);

const joinLines = (items: string[]) => items.join("\n");

const createBlankPage = (index: number): ResumePageContent => ({
  id: `new-page-${index + 1}`,
  title: "New Page",
  subtitle: "",
  summary: "",
  body: [],
  highlights: [],
  accent: "",
  borderClass: "",
  noCard: false,
});

const updatePage = (
  pages: ResumePageContent[],
  index: number,
  patch: Partial<ResumePageContent>
) => pages.map((page, pageIndex) => (pageIndex === index ? { ...page, ...patch } : page));

const updateOverviewDetail = (
  details: OverviewDetailItem[],
  index: number,
  patch: Partial<OverviewDetailItem>
) => details.map((detail, detailIndex) => (detailIndex === index ? { ...detail, ...patch } : detail));

const reorderArray = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const lockedResumePageIds = new Set([
  "other-working-experience",
  "projects",
  "key-skills",
  "tools-equipment",
  "highlighted-credentials",
  "education-honors",
  "contact",
  "health-and-safety",
  "languages",
  "portfolio",
  "who-am-i",
  "linguistic-psychometrics",
]);

export const ResumePagesEditor = ({
  items,
  onChange,
  overviewDetails,
  onOverviewDetailsChange,
  rollingKeywordRows,
  onRollingKeywordRowsChange,
}: ResumePagesEditorProps) => {
  const [openPage, setOpenPage] = useState<string>(items[0] ? "overview" : "");
  const [dragState, setDragState] = useState<{ kind: "overview" | "job"; index: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    kind: "overview" | "job";
    index: number;
    position: "before" | "after";
  } | null>(null);
  const overviewPage = items[0];
  const jobDescriptionPages = items.filter(
    (page) => page.id !== "overview" && !lockedResumePageIds.has(page.id)
  );
  const lockedPages = items.filter((page) => lockedResumePageIds.has(page.id));
  const commitReorderedPages = (reorderedPages: ResumePageContent[]) => {
    onChange([items[0], ...reorderedPages, ...lockedPages]);
  };

  const handleDragOverRow = (
    event: DragEvent<HTMLDivElement>,
    kind: "overview" | "job",
    index: number
  ) => {
    event.preventDefault();

    if (!dragState || dragState.kind !== kind) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: "before" | "after" = event.clientY < midpoint ? "before" : "after";

    setDropTarget({ kind, index, position });
  };

  const handleDropReorder = (
    event: DragEvent<HTMLDivElement>,
    kind: "overview" | "job",
    targetIndex: number,
    position: "before" | "after"
  ) => {
    event.preventDefault();

    if (!dragState || dragState.kind !== kind) {
      setDropTarget(null);
      setDragState(null);
      return;
    }

    const sourceIndex = dragState.index;
    const sourceItems = kind === "overview" ? overviewDetails : jobDescriptionPages;
    let nextIndex = position === "before" ? targetIndex : targetIndex + 1;

    if (sourceIndex < nextIndex) {
      nextIndex -= 1;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    if (nextIndex > sourceItems.length - 1) {
      nextIndex = sourceItems.length - 1;
    }

    if (sourceIndex === nextIndex) {
      setDropTarget(null);
      setDragState(null);
      return;
    }

    if (kind === "overview") {
      onOverviewDetailsChange(reorderArray(overviewDetails, sourceIndex, nextIndex));
      setDropTarget(null);
      setDragState(null);
      return;
    }

    if (kind === "job") {
      commitReorderedPages(reorderArray(jobDescriptionPages, sourceIndex, nextIndex));
      setDropTarget(null);
      setDragState(null);
      return;
    }
  };

  const handleAddPage = () => {
    const nextPage = createBlankPage(items.length);
    const nextPages = [items[0], nextPage, ...items.slice(1)];

    onChange(nextPages);
    setOpenPage("job-description");
  };

  const handleDeletePage = (pageIndex: number) => {
    const nextPages = items.filter((_, currentIndex) => currentIndex !== pageIndex);
    onChange(nextPages);
    setOpenPage("job-description");
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Resume Pages</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete the page objects from the resume file.</p>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        value={openPage}
        onValueChange={(value) => setOpenPage(value)}
        className="rounded-2xl border border-border/70 bg-background/90"
      >
        <AccordionItem value="overview" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline min-w-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden text-left">
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Overview</div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            {overviewPage ? (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between gap-4" />

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      value={overviewPage.title}
                      onChange={(event) => onChange(updatePage(items, 0, { title: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Subtitle</span>
                    <input
                      value={overviewPage.subtitle}
                      onChange={(event) => onChange(updatePage(items, 0, { subtitle: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Overview cards</div>
                  <p className="text-xs text-muted-foreground">
                    Edit the 4 card texts shown on the first page (domicile, origin, relocation, work preference).
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {overviewDetails.map((detail, detailIndex) => (
                      <div
                        key={`overview-detail-${detailIndex}`}
                        className="relative flex items-center gap-1.5"
                        onDragOver={(event) => handleDragOverRow(event, "overview", detailIndex)}
                        onDrop={(event) =>
                          handleDropReorder(
                            event,
                            "overview",
                            detailIndex,
                            dropTarget?.kind === "overview" && dropTarget.index === detailIndex
                              ? dropTarget.position
                              : "before"
                          )
                        }
                      >
                        {dropTarget?.kind === "overview" && dropTarget.index === detailIndex && dropTarget.position === "before" ? (
                          <div className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                        ) : null}
                        {dropTarget?.kind === "overview" && dropTarget.index === detailIndex && dropTarget.position === "after" ? (
                          <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                        ) : null}
                        <button
                          type="button"
                          draggable
                          onDragStart={() => setDragState({ kind: "overview", index: detailIndex })}
                          onDragEnd={() => {
                            setDropTarget(null);
                            setDragState(null);
                          }}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                          aria-label="Drag to reorder card"
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </button>
                        <label className="flex-1">
                          <input
                            value={detail.text}
                            onChange={(event) =>
                              onOverviewDetailsChange(
                                updateOverviewDetail(overviewDetails, detailIndex, {
                                  text: event.target.value,
                                })
                              )
                            }
                            className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <KeywordRowsEditor rows={rollingKeywordRows} onChange={onRollingKeywordRowsChange} />
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="job-description" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline min-w-0 overflow-hidden">
            <div className="min-w-0 overflow-hidden text-left">
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Job Description</div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1" />
                <button
                  type="button"
                  onClick={handleAddPage}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                  aria-label="Add page"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {jobDescriptionPages.map((page, sectionIndex) => {
                  const itemIndex = items.findIndex((item) => item === page);
                  const value = `job-${sectionIndex}`;

                  return (
                    <AccordionItem
                      key={page.id || `job-${sectionIndex}`}
                      value={value}
                      className="relative rounded-2xl border border-border/70 bg-background px-4"
                      onDragOver={(event) => handleDragOverRow(event, "job", sectionIndex)}
                      onDrop={(event) =>
                        handleDropReorder(
                          event,
                          "job",
                          sectionIndex,
                          dropTarget?.kind === "job" && dropTarget.index === sectionIndex ? dropTarget.position : "before"
                        )
                      }
                    >
                      {dropTarget?.kind === "job" && dropTarget.index === sectionIndex && dropTarget.position === "before" ? (
                        <div className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                      ) : null}
                      {dropTarget?.kind === "job" && dropTarget.index === sectionIndex && dropTarget.position === "after" ? (
                        <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                      ) : null}
                      <AccordionTrigger className="py-4 text-left no-underline hover:no-underline min-w-0 overflow-hidden">
                        <div className="flex min-w-0 flex-1 overflow-hidden items-center gap-1.5 text-left">
                          <button
                            type="button"
                            draggable
                            onDragStart={() => setDragState({ kind: "job", index: sectionIndex })}
                            onDragEnd={() => {
                              setDropTarget(null);
                              setDragState(null);
                            }}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder job page"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </button>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="truncate text-lg font-semibold text-foreground">{page.title || "Untitled page"}</div>
                            <div className="mt-1 truncate text-sm text-muted-foreground">{page.subtitle || "No subtitle"}</div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-4 pt-2">
                        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Job page</p>
                              <p className="text-sm text-muted-foreground">Full CRUD is enabled for this page.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeletePage(itemIndex)}
                              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Title</span>
                              <input
                                value={page.title}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { title: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Subtitle</span>
                              <input
                                value={page.subtitle}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { subtitle: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Summary</span>
                              <textarea
                                value={page.summary ?? ""}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { summary: event.target.value }))}
                                rows={3}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Body lines</span>
                              <textarea
                                value={joinLines(page.body ?? [])}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { body: splitLines(event.target.value) }))}
                                rows={4}
                                placeholder="One line per body entry"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className="text-sm font-medium text-foreground">Highlights</span>
                              <textarea
                                value={joinLines(page.highlights ?? [])}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { highlights: splitLines(event.target.value) }))}
                                rows={3}
                                placeholder="One highlight per line"
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Accent class</span>
                              <input
                                value={page.accent ?? ""}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { accent: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Border class</span>
                              <input
                                value={page.borderClass ?? ""}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { borderClass: event.target.value }))}
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                              />
                            </label>

                            <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground md:col-span-2">
                              <input
                                type="checkbox"
                                checked={Boolean(page.noCard)}
                                onChange={(event) => onChange(updatePage(items, itemIndex, { noCard: event.target.checked }))}
                                className="h-4 w-4 rounded border-border"
                              />
                              No card layout
                            </label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No resume pages yet. Add a page to begin.
        </div>
      ) : null}
    </section>
  );
};
