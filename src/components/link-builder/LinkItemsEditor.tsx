import { type ChangeEvent, type DragEvent, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LinkBuilderContent } from "@/data/linkBuilderContent";

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item);

const joinLines = (items: string[]) => items.join("\n");

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

type LinkItemsEditorProps = {
  links: LinkBuilderContent["links"];
  onChange: (next: LinkBuilderContent["links"]) => void;
};

const LinkItemsEditor = ({ links, onChange }: LinkItemsEditorProps) => {
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

              <AccordionTrigger className="py-4 text-left no-underline hover:no-underline min-w-0 overflow-hidden">
                <div className="flex min-w-0 flex-1 overflow-hidden items-center gap-1.5 text-left">
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

export default LinkItemsEditor;
