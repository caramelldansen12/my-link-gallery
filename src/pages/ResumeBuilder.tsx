import { ChevronDown, Download, GripVertical, Plus, Redo2, RotateCcw, Trash2, Undo2, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
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
  type AwardItem,
  type EducationDetails,
  type OverviewDetailItem,
  type OtherWorkingExperience,
  type ResumeBuilderContent,
  type ResumePageContent,
  type SkillGroups,
  type ToolsGroups,
} from "@/data/resumeBuilderContent";
import { downloadResumeTsx, parseResumeContentFromSource } from "@/lib/resumeBuilderGenerator";
import resumeCurrentSource from "@/pages/Resume.tsx?raw";
import { toast } from "sonner";

type SectionId =
  | "resumePages"
  | "projectItems"
  | "otherWorkingExperiences"
  | "educationDetails"
  | "honorsAndAwards"
  | "keySkills"
  | "toolsAndEquipment"
  | "highlightedCredentials";

const sections: Array<{ id: SectionId; label: string; description: string }> = [
  { id: "resumePages", label: "Resume Pages", description: "Create, edit, and remove page records." },
  { id: "projectItems", label: "Project Items", description: "Edit the project item list." },
  {
    id: "otherWorkingExperiences",
    label: "Other Working Experience",
    description: "Manage the additional work history cards.",
  },
  { id: "educationDetails", label: "Education Details", description: "Create, edit, reorder, and delete education records." },
  { id: "honorsAndAwards", label: "Honors and Awards", description: "Manage certification and award entries." },
  { id: "keySkills", label: "Key Skills", description: "Edit the skill bands by proficiency level." },
  { id: "toolsAndEquipment", label: "Tools and Equipment", description: "Edit the tool bands by proficiency level." },
  { id: "highlightedCredentials", label: "Highlighted Credentials", description: "Edit the credential list." },
];

const classNames = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

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

const createBlankExperience = (): OtherWorkingExperience => ({
  title: "New Working Experience",
  subtitle: "",
  tags: [],
});

const createBlankAward = (): AwardItem => ({
  title: "New Award",
  issuer: "",
  note: "",
});

const createBlankEducation = (): EducationDetails => ({
  institution: "",
  degree: "",
  period: "",
  grade: "",
  focus: "",
});

const updatePage = (
  pages: ResumePageContent[],
  index: number,
  patch: Partial<ResumePageContent>
) => pages.map((page, pageIndex) => (pageIndex === index ? { ...page, ...patch } : page));

const updateExperience = (
  experiences: OtherWorkingExperience[],
  index: number,
  patch: Partial<OtherWorkingExperience>
) => experiences.map((experience, experienceIndex) => (experienceIndex === index ? { ...experience, ...patch } : experience));

const updateAward = (awards: AwardItem[], index: number, patch: Partial<AwardItem>) =>
  awards.map((award, awardIndex) => (awardIndex === index ? { ...award, ...patch } : award));

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

const KEYWORD_ROW_LIMIT = 12;
const KEYWORD_ITEMS_PER_ROW_LIMIT = 8;

const normalizeKeywordRows = (rows: string[][]) => {
  const normalizedRows = rows
    .slice(0, KEYWORD_ROW_LIMIT)
    .map((row) => row.map((item) => item.trim()).filter(Boolean).slice(0, KEYWORD_ITEMS_PER_ROW_LIMIT));

  while (normalizedRows.length < KEYWORD_ROW_LIMIT) {
    normalizedRows.push([]);
  }

  return normalizedRows;
};

const KeywordPillInputRow = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");

  const commitPill = (rawValue: string) => {
    const value = rawValue.trim();

    if (!value || items.length >= KEYWORD_ITEMS_PER_ROW_LIMIT) {
      return;
    }

    onChange([...items, value]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault();
      commitPill(draft);
      setDraft("");
      return;
    }

    if ((event.key === "Backspace" || event.key === "Delete") && draft.length === 0 && items.length > 0) {
      event.preventDefault();
      onChange(items.slice(0, -1));
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (!nextValue.includes(",")) {
      setDraft(nextValue);
      return;
    }

    const segments = nextValue.split(",");
    const trailingValue = segments.pop() ?? "";
    const parsed = segments.map((segment) => segment.trim()).filter(Boolean);

    if (parsed.length > 0) {
      const availableSlots = Math.max(0, KEYWORD_ITEMS_PER_ROW_LIMIT - items.length);
      const nextPills = parsed.slice(0, availableSlots);

      if (nextPills.length > 0) {
        onChange([...items, ...nextPills]);
      }
    }

    setDraft(trailingValue);
  };

  return (
    <div className="px-0 py-1">
      <div className="flex min-h-9 flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs text-foreground"
          >
            <span className="max-w-[16rem] truncate">{item}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          value={draft}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={items.length >= KEYWORD_ITEMS_PER_ROW_LIMIT ? "Line is full" : "Type and press comma"}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          disabled={items.length >= KEYWORD_ITEMS_PER_ROW_LIMIT}
        />
      </div>
    </div>
  );
};

const lockedResumePageIds = new Set([
  "other-working-experience",
  "projects",
  "key-skills",
  "tools-equipment",
  "highlighted-credentials",
  "linguistic-psychometrics",
  "education-honors",
  "contact",
]);

const stringArrayRow = (
  items: string[],
  index: number,
  onChange: (next: string) => void,
  onDelete: () => void
) => (
  <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/90 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
    <textarea
      value={items[index]}
      onChange={(event) => onChange(event.target.value)}
      rows={2}
      className="min-h-[54px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
    />
    <button
      type="button"
      onClick={onDelete}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="h-4 w-4" />
      Remove
    </button>
  </div>
);

const StringArrayEditor = ({
  title,
  description,
  items,
  onChange,
  emptyLabel,
  placeholder,
}: {
  title: string;
  description: string;
  items: string[];
  onChange: (next: string[]) => void;
  emptyLabel: string;
  placeholder: string;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${title}-${index}`} className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Item {index + 1}</div>
              {stringArrayRow(
                items,
                index,
                (nextValue) => onChange(items.map((current, currentIndex) => (currentIndex === index ? nextValue : current))),
                () => onChange(items.filter((_, currentIndex) => currentIndex !== index))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{placeholder}</p>
    </section>
  );
};

const ProjectItemsTableEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  const [dragState, setDragState] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: "before" | "after" } | null>(null);

  const handleDragOverRow = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();

    if (dragState === null) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: "before" | "after" = event.clientY < midpoint ? "before" : "after";

    setDropTarget({ index, position });
  };

  const handleDropReorder = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
    position: "before" | "after"
  ) => {
    event.preventDefault();

    if (dragState === null) {
      setDropTarget(null);
      return;
    }

    let nextIndex = position === "before" ? targetIndex : targetIndex + 1;

    if (dragState < nextIndex) {
      nextIndex -= 1;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    if (nextIndex > items.length - 1) {
      nextIndex = items.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(items, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Project Items</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit the project item list in a compact table layout.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`project-item-${index}`}
              className="relative flex items-center gap-2 rounded-2xl"
              onDragOver={(event) => handleDragOverRow(event, index)}
              onDrop={(event) =>
                handleDropReorder(
                  event,
                  index,
                  dropTarget?.index === index ? dropTarget.position : "before"
                )
              }
            >
              <button
                type="button"
                draggable
                onDragStart={() => setDragState(index)}
                onDragEnd={() => {
                  setDropTarget(null);
                  setDragState(null);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder project item"
                title="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>

              <div className="min-w-0 flex-1">
                <input
                  value={item}
                  onChange={(event) =>
                    onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                />
              </div>

              <button
                type="button"
                onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              {dropTarget?.index === index && dropTarget.position === "before" ? (
                <div className="pointer-events-none absolute inset-x-0 -top-1 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
              {dropTarget?.index === index && dropTarget.position === "after" ? (
                <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No project items yet. Add a row to begin.
        </div>
      ) : null}
    </section>
  );
};

const HighlightedCredentialsTableEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) => {
  const [dragState, setDragState] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: "before" | "after" } | null>(null);

  const handleDragOverRow = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();

    if (dragState === null) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position: "before" | "after" = event.clientY < midpoint ? "before" : "after";

    setDropTarget({ index, position });
  };

  const handleDropReorder = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
    position: "before" | "after"
  ) => {
    event.preventDefault();

    if (dragState === null) {
      setDropTarget(null);
      return;
    }

    let nextIndex = position === "before" ? targetIndex : targetIndex + 1;

    if (dragState < nextIndex) {
      nextIndex -= 1;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    if (nextIndex > items.length - 1) {
      nextIndex = items.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(items, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Highlighted Credentials</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit the credential list in a compact table layout.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`credential-item-${index}`}
              className="relative flex items-center gap-2 rounded-2xl"
              onDragOver={(event) => handleDragOverRow(event, index)}
              onDrop={(event) =>
                handleDropReorder(
                  event,
                  index,
                  dropTarget?.index === index ? dropTarget.position : "before"
                )
              }
            >
              <button
                type="button"
                draggable
                onDragStart={() => setDragState(index)}
                onDragEnd={() => {
                  setDropTarget(null);
                  setDragState(null);
                }}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder credential"
                title="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>

              <div className="min-w-0 flex-1">
                <input
                  value={item}
                  onChange={(event) =>
                    onChange(items.map((current, currentIndex) => (currentIndex === index ? event.target.value : current)))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                />
              </div>

              <button
                type="button"
                onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              {dropTarget?.index === index && dropTarget.position === "before" ? (
                <div className="pointer-events-none absolute inset-x-0 -top-1 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
              {dropTarget?.index === index && dropTarget.position === "after" ? (
                <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-foreground/70" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No highlighted credentials yet. Add a row to begin.
        </div>
      ) : null}
    </section>
  );
};

const ResumePagesEditor = ({
  items,
  onChange,
  overviewDetails,
  onOverviewDetailsChange,
  rollingKeywordRows,
  onRollingKeywordRowsChange,
}: {
  items: ResumePageContent[];
  onChange: (next: ResumePageContent[]) => void;
  overviewDetails: OverviewDetailItem[];
  onOverviewDetailsChange: (next: OverviewDetailItem[]) => void;
  rollingKeywordRows: string[][];
  onRollingKeywordRowsChange: (next: string[][]) => void;
}) => {
  const [openPage, setOpenPage] = useState<string>(items[0] ? "overview" : "");
  const [dragState, setDragState] = useState<{ kind: "overview" | "keyword" | "job" | "locked"; index: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    kind: "overview" | "keyword" | "job" | "locked";
    index: number;
    position: "before" | "after";
  } | null>(null);
  const overviewPage = items[0];
  const jobDescriptionPages = items.filter(
    (page) => page.id !== "overview" && !lockedResumePageIds.has(page.id)
  );
  const lockedPages = items.filter((page) => lockedResumePageIds.has(page.id));
  const normalizedKeywordRows = normalizeKeywordRows(rollingKeywordRows);

  const commitReorderedPages = (kind: "job" | "locked", reorderedPages: ResumePageContent[]) => {
    const nextPages =
      kind === "job"
        ? [items[0], ...reorderedPages, ...lockedPages]
        : [items[0], ...jobDescriptionPages, ...reorderedPages];

    onChange(nextPages);
  };

  const handleDragOverRow = (
    event: DragEvent<HTMLDivElement>,
    kind: "overview" | "keyword" | "job" | "locked",
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
    kind: "overview" | "keyword" | "job" | "locked",
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
    const sourceItems = kind === "overview" ? overviewDetails : kind === "keyword" ? normalizedKeywordRows : kind === "job" ? jobDescriptionPages : lockedPages;
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

    if (kind === "keyword") {
      onRollingKeywordRowsChange(reorderArray(normalizedKeywordRows, sourceIndex, nextIndex));
      setDropTarget(null);
      setDragState(null);
      return;
    }

    if (kind === "job") {
      commitReorderedPages("job", reorderArray(jobDescriptionPages, sourceIndex, nextIndex));
      setDropTarget(null);
      setDragState(null);
      return;
    }

    commitReorderedPages("locked", reorderArray(lockedPages, sourceIndex, nextIndex));
    setDropTarget(null);
    setDragState(null);
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
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
            <div className="min-w-0 text-left">
              {/* <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</div> */}
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Overview</div>
              {/* <div className="mt-1 truncate text-sm text-muted-foreground">Editable values only. No delete action.</div> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            {overviewPage ? (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview page</p>
                    <p className="text-sm text-muted-foreground">Edit values only. This page cannot be deleted.</p>
                  </div> */}
                  {/* <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Fixed
                  </span> */}
                </div>

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

                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Pills wall</div>
                  <p className="text-xs text-muted-foreground">
                    Customize the scrolling pills text. Type a word and press comma to create a pill. You can remove pills with Backspace/Delete in an empty input or by clicking X on each pill. Limits: {KEYWORD_ROW_LIMIT} lines and {KEYWORD_ITEMS_PER_ROW_LIMIT} pills per line.
                  </p>
                  <div className="grid gap-3">
                    {normalizedKeywordRows.map((row, rowIndex) => (
                      <div
                        key={`keyword-row-${rowIndex}`}
                        className="relative flex items-start gap-1.5"
                        onDragOver={(event) => handleDragOverRow(event, "keyword", rowIndex)}
                        onDrop={(event) =>
                          handleDropReorder(
                            event,
                            "keyword",
                            rowIndex,
                            dropTarget?.kind === "keyword" && dropTarget.index === rowIndex
                              ? dropTarget.position
                              : "before"
                          )
                        }
                      >
                        {dropTarget?.kind === "keyword" && dropTarget.index === rowIndex && dropTarget.position === "before" ? (
                          <div className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                        ) : null}
                        {dropTarget?.kind === "keyword" && dropTarget.index === rowIndex && dropTarget.position === "after" ? (
                          <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                        ) : null}
                        <button
                          type="button"
                          draggable
                          onDragStart={() => setDragState({ kind: "keyword", index: rowIndex })}
                          onDragEnd={() => {
                            setDropTarget(null);
                            setDragState(null);
                          }}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                          aria-label="Drag to reorder line"
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex-1">
                          <KeywordPillInputRow
                            items={row}
                            onChange={(nextItems) => {
                              const normalizedRows = normalizeKeywordRows(rollingKeywordRows);
                              normalizedRows[rowIndex] = nextItems.slice(0, KEYWORD_ITEMS_PER_ROW_LIMIT);
                              onRollingKeywordRowsChange(normalizedRows);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="job-description" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
            <div className="min-w-0 text-left">
              {/* <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contents</div> */}
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Job Description</div>
              {/* <div className="mt-1 truncate text-sm text-muted-foreground">Full CRUD for editable job pages.</div> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pages</p>
                  <p className="text-sm text-muted-foreground">Create, read, update, and delete these pages.</p> */}
                </div>
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
                      <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                        <div className="flex min-w-0 items-center gap-1.5 text-left">
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

        <AccordionItem value="locked" className="px-4">
          <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
            <div className="min-w-0 text-left">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Locked</div>
              <div className="mt-1 truncate text-lg font-semibold text-foreground">Others</div>
              {/* <div className="mt-1 truncate text-sm text-muted-foreground">Read-only page info here.</div> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
              <Accordion type="single" collapsible className="space-y-2">
                {lockedPages.map((page, sectionIndex) => {
                  const value = `locked-${sectionIndex}`;

                  return (
                    <AccordionItem
                      key={page.id || `locked-${sectionIndex}`}
                      value={value}
                      className="relative rounded-2xl border border-border/70 bg-background px-4"
                      onDragOver={(event) => handleDragOverRow(event, "locked", sectionIndex)}
                      onDrop={(event) =>
                        handleDropReorder(
                          event,
                          "locked",
                          sectionIndex,
                          dropTarget?.kind === "locked" && dropTarget.index === sectionIndex ? dropTarget.position : "before"
                        )
                      }
                    >
                      {dropTarget?.kind === "locked" && dropTarget.index === sectionIndex && dropTarget.position === "before" ? (
                        <div className="pointer-events-none absolute -top-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                      ) : null}
                      {dropTarget?.kind === "locked" && dropTarget.index === sectionIndex && dropTarget.position === "after" ? (
                        <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-foreground/70" />
                      ) : null}
                      <AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
                        <div className="flex min-w-0 items-center gap-1.5 text-left">
                          <button
                            type="button"
                            draggable
                            onDragStart={() => setDragState({ kind: "locked", index: sectionIndex })}
                            onDragEnd={() => {
                              setDropTarget(null);
                              setDragState(null);
                            }}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder locked page"
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
                        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 text-sm text-foreground/90">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">ID</p>
                            <p className="mt-1">{page.id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Title</p>
                            <p className="mt-1 font-medium text-foreground">{page.title}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subtitle</p>
                            <p className="mt-1 text-muted-foreground">{page.subtitle || "No subtitle"}</p>
                          </div>
                          {page.summary ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Summary</p>
                              <p className="mt-1 leading-relaxed text-foreground/90">{page.summary}</p>
                            </div>
                          ) : null}
                          {page.body?.length ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Body lines</p>
                              <ul className="mt-2 space-y-2">
                                {page.body.map((line) => (
                                  <li key={line} className="rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground/90">
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {page.highlights?.length ? (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Highlights</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {page.highlights.map((highlight) => (
                                  <span key={highlight} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
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

const ExperienceEditor = ({
  items,
  onChange,
}: {
  items: OtherWorkingExperience[];
  onChange: (next: OtherWorkingExperience[]) => void;
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

    if (nextIndex > items.length - 1) {
      nextIndex = items.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(items, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Other Working Experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete the extra experience cards.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, createBlankExperience()])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add experience
        </button>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {items.map((experience, index) => (
          <AccordionItem
            key={`experience-item-${index}`}
            value={`experience-${index}`}
            className="relative rounded-3xl border border-border/70 bg-background/90 px-4 shadow-sm"
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
              <div className="flex min-w-0 items-start gap-1.5 text-left">
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDragState(index)}
                  onDragEnd={() => {
                    setDropTarget(null);
                    setDragState(null);
                  }}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                  aria-label="Drag to reorder experience card"
                  title="Drag to reorder"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-foreground">{experience.title || "Untitled experience"}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{experience.subtitle || "No subtitle"}</p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      value={experience.title}
                      onChange={(event) => onChange(updateExperience(items, index, { title: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Subtitle</span>
                    <input
                      value={experience.subtitle}
                      onChange={(event) => onChange(updateExperience(items, index, { subtitle: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Tags</span>
                    <textarea
                      value={joinLines(experience.tags)}
                      onChange={(event) => onChange(updateExperience(items, index, { tags: splitLines(event.target.value) }))}
                      rows={3}
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
    </section>
  );
};

const AwardEditor = ({
  items,
  onChange,
}: {
  items: AwardItem[];
  onChange: (next: AwardItem[]) => void;
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

    if (nextIndex > items.length - 1) {
      nextIndex = items.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(items, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Honors and Awards</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete the award entries.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, createBlankAward()])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add award
        </button>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {items.map((award, index) => (
          <AccordionItem
            key={`award-item-${index}`}
            value={`award-${index}`}
            className="relative rounded-3xl border border-border/70 bg-background/90 px-4 shadow-sm"
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
              <div className="flex min-w-0 items-start gap-1.5 text-left">
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDragState(index)}
                  onDragEnd={() => {
                    setDropTarget(null);
                    setDragState(null);
                  }}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                  aria-label="Drag to reorder award card"
                  title="Drag to reorder"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-foreground">{award.title || "Untitled award"}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{award.issuer || "No issuer"}</p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      value={award.title}
                      onChange={(event) => onChange(updateAward(items, index, { title: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Issuer</span>
                    <input
                      value={award.issuer}
                      onChange={(event) => onChange(updateAward(items, index, { issuer: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Note</span>
                    <textarea
                      value={award.note}
                      onChange={(event) => onChange(updateAward(items, index, { note: event.target.value }))}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

const EducationEditor = ({
  value,
  onChange,
}: {
  value: EducationDetails[];
  onChange: (next: EducationDetails[]) => void;
}) => {
  const [dragState, setDragState] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: "before" | "after" } | null>(null);
  const educationItems = value;

  const updateEducationItem = (index: number, patch: Partial<EducationDetails>) => {
    const next = educationItems.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
    onChange(next);
  };

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

    if (nextIndex > educationItems.length - 1) {
      nextIndex = educationItems.length - 1;
    }

    if (dragState !== nextIndex) {
      onChange(reorderArray(educationItems, dragState, nextIndex));
    }

    setDropTarget(null);
    setDragState(null);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Education Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, read, update, and delete education records.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...educationItems, createBlankEducation()])}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <Plus className="h-4 w-4" />
          Add education
        </button>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {educationItems.map((item, index) => (
          <AccordionItem
            key={`education-item-${index}`}
            value={`education-${index}`}
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
                  aria-label="Drag to reorder education card"
                  title="Drag to reorder"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-foreground">{item.institution || "No institution"}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{item.degree || "No degree"}</p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => onChange(educationItems.filter((_, itemIndex) => itemIndex !== index))}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Institution</span>
                    <input
                      value={item.institution}
                      onChange={(event) => updateEducationItem(index, { institution: event.target.value })}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Degree</span>
                    <input
                      value={item.degree}
                      onChange={(event) => updateEducationItem(index, { degree: event.target.value })}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Period</span>
                    <input
                      value={item.period}
                      onChange={(event) => updateEducationItem(index, { period: event.target.value })}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Grade</span>
                    <input
                      value={item.grade}
                      onChange={(event) => updateEducationItem(index, { grade: event.target.value })}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Focus</span>
                    <textarea
                      value={item.focus}
                      onChange={(event) => updateEducationItem(index, { focus: event.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {educationItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          No education records yet. Add an education entry to begin.
        </div>
      ) : null}
    </section>
  );
};

const SkillGroupsEditor = <T extends SkillGroups | ToolsGroups>({
  title,
  description,
  value,
  onChange,
  groups,
}: {
  title: string;
  description: string;
  value: T;
  onChange: (next: T) => void;
  groups: Array<{ key: keyof T; label: string }>;
}) => {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => {
          const items = value[group.key] as string[];

          return (
            <label key={String(group.key)} className="space-y-2 rounded-2xl border border-border/70 bg-background/90 p-4">
              <span className="text-sm font-medium text-foreground">{group.label}</span>
              <textarea
                value={joinLines(items)}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [group.key]: event.target.value.split(/\r?\n/),
                  } as T)
                }
                rows={8}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
              />
              <p className="text-xs text-muted-foreground">One item per line.</p>
            </label>
          );
        })}
      </div>
    </section>
  );
};

const BuilderPanel = ({
  activeSection,
  content,
  setContent,
}: {
  activeSection: SectionId;
  content: ResumeBuilderContent;
  setContent: (next: ResumeBuilderContent) => void;
}) => {
  if (activeSection === "resumePages") {
    return (
      <ResumePagesEditor
        items={content.resumePages}
        onChange={(next) => setContent({ ...content, resumePages: next })}
        overviewDetails={content.overviewDetails}
        onOverviewDetailsChange={(next) => setContent({ ...content, overviewDetails: next })}
        rollingKeywordRows={content.rollingKeywordRows}
        onRollingKeywordRowsChange={(next) => setContent({ ...content, rollingKeywordRows: next })}
      />
    );
  }

  if (activeSection === "projectItems") {
    return (
      <ProjectItemsTableEditor
        items={content.projectItems}
        onChange={(next) => setContent({ ...content, projectItems: next })}
      />
    );
  }

  if (activeSection === "otherWorkingExperiences") {
    return (
      <ExperienceEditor
        items={content.otherWorkingExperiences}
        onChange={(next) => setContent({ ...content, otherWorkingExperiences: next })}
      />
    );
  }

  if (activeSection === "educationDetails") {
    return <EducationEditor value={content.educationDetails} onChange={(next) => setContent({ ...content, educationDetails: next })} />;
  }

  if (activeSection === "honorsAndAwards") {
    return <AwardEditor items={content.honorsAndAwards} onChange={(next) => setContent({ ...content, honorsAndAwards: next })} />;
  }

  if (activeSection === "keySkills") {
    return (
      <SkillGroupsEditor
        title="Key Skills"
        description="Edit each proficiency band with one skill per line."
        value={content.keySkills}
        onChange={(next) => setContent({ ...content, keySkills: next as SkillGroups })}
        groups={[
          { key: "proficient", label: "Proficient" },
          { key: "fluent", label: "Fluent" },
          { key: "entryLevel", label: "Entry-level" },
        ]}
      />
    );
  }

  if (activeSection === "toolsAndEquipment") {
    return (
      <SkillGroupsEditor
        title="Tools and Equipment"
        description="Edit each proficiency band with one tool per line."
        value={content.toolsAndEquipment}
        onChange={(next) => setContent({ ...content, toolsAndEquipment: next as ToolsGroups })}
        groups={[
          { key: "proficient", label: "Proficient" },
          { key: "fluent", label: "Fluent" },
          { key: "entryLevel", label: "Entry-level" },
          { key: "introductory", label: "Introductory" },
        ]}
      />
    );
  }

  return (
    <HighlightedCredentialsTableEditor
      items={content.highlightedCredentials}
      onChange={(next) => setContent({ ...content, highlightedCredentials: next })}
    />
  );
};

const ResumeBuilder = () => {
  const [content, setContent] = useState<ResumeBuilderContent>(() => {
    const parsed = parseResumeContentFromSource(resumeCurrentSource);
    return parsed ?? createResumeBuilderContent();
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("resumePages");
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [isSectionsExpanded, setIsSectionsExpanded] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);
  const [builderStatusHeight, setBuilderStatusHeight] = useState(0);
  const builderStatusRef = useRef<HTMLElement | null>(null);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<ResumeBuilderContent[]>([]);
  const redoStackRef = useRef<ResumeBuilderContent[]>([]);

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
    setContent((current) => {
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

  const handleReset = () => {
    updateContent(createResumeBuilderContent());
    setActiveSection("resumePages");
    toast.success("Builder reset to the current Resume.tsx defaults.");
  };

  const handleGenerate = () => {
    downloadResumeTsx(content);
    setIsNotesOpen(true);
    toast.success("Resume.tsx downloaded.");
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
            <DialogTitle>Generated Resume.tsx downloaded</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              The Generate button downloads a full <span className="font-medium text-foreground">Resume.tsx</span> file.
              It does not write to the workspace or commit anything.
            </p>
            <p>Replace your source file manually after reviewing the download.</p>
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

      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Build Your Own Resume Page</DialogTitle>
            <DialogDescription>Follow these steps to customize and publish your resume page.</DialogDescription>
          </DialogHeader>

          <ol className="space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 list-decimal">
            <li>Clone the git repo.</li>
            <li>Customize the Resume.tsx.</li>
            <li>Locate and replace the Resume.tsx.</li>
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
    </div>
  );
};

export default ResumeBuilder;
