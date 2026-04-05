import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { categories, links, LinkCategory } from "@/data/links";

interface FilterSidebarProps {
  selectedCategories: LinkCategory[];
  onToggleCategory: (cat: LinkCategory) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const allTags = Array.from(new Set(links.flatMap((l) => l.tags))).sort();

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({
  selectedCategories,
  onToggleCategory,
  selectedTags,
  onToggleTag,
}: FilterSidebarProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-base font-semibold text-foreground font-sans">Filters</h3>

      <FilterSection title="Category">
        {categories.map((cat) => (
          <label key={cat} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-foreground hover:text-foreground/70 transition-colors">
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => onToggleCategory(cat)}
              className="rounded border-border accent-primary h-3.5 w-3.5"
            />
            {cat}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Tags" defaultOpen={false}>
        {allTags.map((tag) => (
          <label key={tag} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-foreground hover:text-foreground/70 transition-colors">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onToggleTag(tag)}
              className="rounded border-border accent-primary h-3.5 w-3.5"
            />
            {tag}
          </label>
        ))}
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;
