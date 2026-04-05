import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { links } from "@/data/links";
import ThemeToggle from "@/components/ThemeToggle";
import LinkCard from "@/components/LinkCard";
import FilterSidebar from "@/components/FilterSidebar";
import BackgroundColorToggle from "@/components/BackgroundColorToggle";

const MonochromePlusBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    type PlusSign = {
      baseX: number;
      baseY: number;
      offsetX: number;
      offsetY: number;
      scale: number;
      size: number;
    };

    const signs: PlusSign[] = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const spacing = 108;
    const plusSize = 7;
    const influenceRadius = 160;
    const targetFrameMs = 1000 / 30;
    let frameId = 0;
    let lastRenderTime = 0;

    const getStrokeStyle = () => {
      const foreground = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();
      return `hsl(${foreground} / 0.18)`;
    };

    let strokeStyle = getStrokeStyle();

    const buildGrid = () => {
      const dpr = Math.max(1, Math.min(1.25, window.devicePixelRatio || 1));
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      signs.length = 0;

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          signs.push({
            baseX: x,
            baseY: y,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            size: plusSize,
          });
        }
      }
    };

    const draw = (timestamp: number) => {
      if (document.hidden) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      if (timestamp - lastRenderTime < targetFrameMs) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      lastRenderTime = timestamp;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1.1;

      for (const sign of signs) {
        const dx = mouse.x - sign.baseX;
        const dy = mouse.y - sign.baseY;
        const distance = Math.hypot(dx, dy) || 1;
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const angle = Math.atan2(dy, dx);

        const targetOffset = influence * 12;
        const targetX = Math.cos(angle) * targetOffset;
        const targetY = Math.sin(angle) * targetOffset;
        const targetScale = 1 + influence * 0.55;

        sign.offsetX += (targetX - sign.offsetX) * 0.15;
        sign.offsetY += (targetY - sign.offsetY) * 0.15;
        sign.scale += (targetScale - sign.scale) * 0.14;

        const x = sign.baseX + sign.offsetX;
        const y = sign.baseY + sign.offsetY;
        const half = (sign.size * sign.scale) / 2;

        ctx.beginPath();
        ctx.moveTo(x, y - half);
        ctx.lineTo(x, y + half);
        ctx.moveTo(x - half, y);
        ctx.lineTo(x + half, y);
        ctx.stroke();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event && event.touches[0]) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
        return;
      }

      if ("clientX" in event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      }
    };

    const handleThemeMutation = () => {
      strokeStyle = getStrokeStyle();
    };

    const mutationObserver = new MutationObserver(handleThemeMutation);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-bg"],
    });

    buildGrid();
    frameId = window.requestAnimationFrame(draw);

    window.addEventListener("resize", buildGrid);
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener("resize", buildGrid);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
};

const Index = () => {
  const pageSize = 12;
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const quickTags = ["Profile", "Personality", "Learning"];

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
    ...selectedTags.map((t) => ({ label: t, type: "tag" as const, value: t })),
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
      <BackgroundColorToggle />

      {/* Header */}
      <header className="border-b border-border bg-card/85 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-4xl">
            Carlos Richard<br />Geraldine
          </h1>
          <div className="max-w-lg text-sm text-muted-foreground md:text-base">
            <p className="font-bold leading-tight text-foreground">Bridge, design, and deliver solutions that matter.</p>
            <p>Team leader // somewhat IT guy // bedroom DJ by night</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
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

        <div className="mb-4 flex flex-wrap gap-2">
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
        <div className="mb-4 flex min-h-8 items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="shrink-0 text-sm font-medium text-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>

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

          {hasFilters && (
            <button
              onClick={clearAll}
              className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Main layout */}
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 md:w-56">
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

                <div className="mt-6 flex items-center justify-between px-2 py-1">
                  {totalPages > 1 ? (
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="h-8 w-8" aria-hidden="true" />
                  )}

                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  {totalPages > 1 ? (
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-8 w-8 items-center justify-center text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="h-8 w-8" aria-hidden="true" />
                  )}
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
