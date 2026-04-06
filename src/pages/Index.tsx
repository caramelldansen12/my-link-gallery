import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { links, linksPageSettings } from "@/data/links";
import ThemeToggle from "@/components/ThemeToggle";
import LinkCard from "@/components/LinkCard";
import FilterSidebar from "@/components/FilterSidebar";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const Index = () => {
  const pageSize = Math.max(1, linksPageSettings.pageSize);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const quickTags = linksPageSettings.quickTags;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAll = () => {
    setSearch("");
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const hasFilters = search || selectedTags.length > 0;

  const filtered = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        !search ||
        link.title.toLowerCase().includes(search.toLowerCase()) ||
        link.description.toLowerCase().includes(search.toLowerCase()) ||
        link.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 || link.tags.some((t) => selectedTags.includes(t));

      return matchesSearch && matchesTags;
    });
  }, [search, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedTags]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const placeholderCount =
    currentPage === totalPages ? pageSize - paginatedLinks.length : 0;

  const activeFilters = [
    ...selectedTags.map((t) => ({ label: t, value: t })),
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
          <h1 className="text-base font-semibold text-foreground md:text-xl">{linksPageSettings.title}</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/links-builder"
              className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
            >
              Build your own
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Search */}
        <div className="mb-4 max-w-xl">
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

        <div className="index-tag-recommendations mb-4 flex flex-wrap gap-2">
          {quickTags.map((tag) => {
            const active = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`hover-chroma-pill rounded-full border px-2.5 py-0.5 text-[10px] font-medium opacity-80 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-sm ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Active filter pills + count */}
        <div className="index-active-filters-row mb-4 flex min-h-8 items-center gap-2 overflow-hidden">
          <span className="shrink-0 text-sm font-medium text-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>

          <div className="index-active-filters-scroll relative z-0 min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-2 pr-16">
              {activeFilters.map((f) => (
                <span
                  key={f.label}
                  className="hover-chroma-pill inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-xs font-medium text-background"
                >
                  {f.label}
                  <button
                    onClick={() => toggleTag(f.value)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
            {hasFilters && (
              <button
                onClick={clearAll}
                className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            )}

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <FilterSidebar
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
            />
          </aside>

          {/* Grid */}
          <main className="flex-1">
            {filtered.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedLinks.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))}

                {Array.from({ length: placeholderCount }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    aria-hidden="true"
                    className="invisible block rounded-lg border border-border bg-card p-5"
                  >
                    <h3 className="mb-1.5 text-lg font-semibold font-sans">Placeholder</h3>
                    <p className="mb-4 text-sm leading-relaxed">Placeholder.</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                        Tag
                      </span>
                    </div>
                  </div>
                ))}
                </div>

              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
                <p className="text-lg font-medium text-foreground">No links found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your tags or search term.
                </p>
                <button
                  onClick={clearAll}
                  className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                >
                  Clear tags
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Link
        to="/"
        aria-label="Resume"
        className={`fixed bottom-4 left-4 z-40 select-none text-5xl font-bold leading-none tracking-tight text-foreground transition-all duration-300 origin-bottom-left hover:scale-110 md:bottom-6 md:left-6 md:text-7xl ${
          currentPage === totalPages ? "opacity-100" : "opacity-25"
        }`}
      >
        ← resume
      </Link>

      </div>

    </div>
  );
};

export default Index;
