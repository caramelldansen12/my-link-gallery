import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { links } from "@/data/links";

const LinkCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <h2 className="mb-6 text-lg font-semibold text-foreground">Quick Links</h2>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-56 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors group/item"
            >
              <p className="text-sm font-medium text-foreground group-hover/item:text-foreground/80 truncate">
                {link.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {link.description}
              </p>
            </a>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors shadow-sm"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LinkCarousel;
