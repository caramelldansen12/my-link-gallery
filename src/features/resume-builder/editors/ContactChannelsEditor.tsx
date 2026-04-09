import { type DragEvent, useState } from "react";
import { Eye, EyeOff, GripVertical } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ContactChannel } from "@/data/resumeBuilderContent";

type ContactChannelsEditorProps = {
  items: ContactChannel[];
  onChange: (next: ContactChannel[]) => void;
};

const updateChannel = (channels: ContactChannel[], index: number, patch: Partial<ContactChannel>) =>
  channels.map((channel, channelIndex) => (channelIndex === index ? { ...channel, ...patch } : channel));

const reorderArray = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const ContactChannelsEditor = ({ items, onChange }: ContactChannelsEditorProps) => {
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
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Contact Channels</h2>
          <p className="mt-1 text-sm text-muted-foreground">Edit the pills shown in the Contact section.</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {items.map((channel, index) => (
          <AccordionItem
            key={`contact-channel-${index}`}
            value={`contact-channel-${index}`}
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

            <AccordionTrigger className="py-4 text-left no-underline hover:no-underline min-w-0 overflow-hidden">
              <div className="flex min-w-0 flex-1 overflow-hidden items-start gap-1.5 text-left">
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDragState(index)}
                  onDragEnd={() => {
                    setDropTarget(null);
                    setDragState(null);
                  }}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground cursor-grab active:cursor-grabbing"
                  aria-label="Drag to reorder contact channel"
                  title="Drag to reorder"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-foreground">{channel.label || "Untitled channel"}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {channel.value || "No value"}
                    {channel.hidden ? " (hidden)" : ""}
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => onChange(updateChannel(items, index, { hidden: !channel.hidden }))}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                  >
                    {channel.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {channel.hidden ? "Show" : "Hide"}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Label</span>
                    <div className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                      {channel.label || "Untitled channel"}
                    </div>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Value</span>
                    <input
                      value={channel.value}
                      onChange={(event) => onChange(updateChannel(items, index, { value: event.target.value }))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-foreground">Href</span>
                    <input
                      value={channel.href}
                      onChange={(event) => onChange(updateChannel(items, index, { href: event.target.value }))}
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
