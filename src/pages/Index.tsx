import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { links, LinkCategory, tagColorMap } from "@/data/links";
import LinkCard from "@/components/LinkCard";
import FilterSidebar from "@/components/FilterSidebar";

const Index = () => {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<LinkCategory[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleCategory = (cat: LinkCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAll = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  const hasFilters = search || selectedCategories.length > 0 || selectedTags.length > 0;

  const filtered = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        !search ||
        link.title.toLowerCase().includes(search.toLowerCase()) ||
        link.description.toLowerCase().includes(search.toLowerCase()) ||
        link.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(link.category);

      const matchesTags =
        selectedTags.length === 0 || link.tags.some((t) => selectedTags.includes(t));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [search, selectedCategories, selectedTags]);

  const activeFilters = [
    ...selectedCategories.map((c) => ({ label: c, type: "category" as const, value: c })),
    ...selectedTags.map((t) => ({ label: t, type: "tag" as const, value: t })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            My Links
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            All my links,<br />one place
          </h1>
          <p className="mt-3 max-w-lg text-base text-muted-foreground">
            Everything I share across the internet — social profiles, projects, content, and tools — all gathered here.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, description, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Active filter pills + count */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>

          {activeFilters.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
            >
              {f.label}
              <button
                onClick={() =>
                  f.type === "category"
                    ? toggleCategory(f.value as LinkCategory)
                    : toggleTag(f.value)
                }
                className="ml-0.5 hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Main layout */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 md:w-56">
            <FilterSidebar
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
            />
          </aside>

          {/* Grid */}
          <main className="flex-1">
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
                <p className="text-lg font-medium text-foreground">No links found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={clearAll}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        Made with ♥ — Replace these links with your own!
      </footer>
    </div>
  );
};

export default Index;
