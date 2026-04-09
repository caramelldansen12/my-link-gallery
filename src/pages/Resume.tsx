import { ArrowLeft, ArrowRightLeft, Briefcase, ChevronLeft, ChevronRight, MapPinned, MapPin } from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";
import ResumeToolsPanel from "@/components/ResumeToolsPanel";
import dataJson from "@/data/data.json";
import type { ContactChannel } from "@/data/resumeBuilderContent";

const OVERVIEW_ICON_MAP = { MapPin, MapPinned, ArrowRightLeft, Briefcase } as const;

const resumeData = dataJson.resume;
const resumePages = resumeData.resumePages;
const projectItems = resumeData.projectItems;
const otherWorkingExperiences = resumeData.otherWorkingExperiences;
const educationDetails = resumeData.educationDetails;
const honorsAndAwards = resumeData.honorsAndAwards;
const keySkills = resumeData.keySkills;
const toolsAndEquipment = resumeData.toolsAndEquipment;
const highlightedCredentials = resumeData.highlightedCredentials;
const contactChannels = (resumeData.contactChannels as ContactChannel[]).filter((ch) => !ch.hidden);
const overviewDetails = (resumeData.overviewDetails as Array<{ icon: string; text: string }>).map((item) => ({
  icon: OVERVIEW_ICON_MAP[item.icon as keyof typeof OVERVIEW_ICON_MAP] ?? MapPin,
  text: item.text,
}));
const rollingKeywordRows = resumeData.rollingKeywordRows;

const linguisticScores = [
  {
    name: "EFSET Common European Framework of Reference for Languages (CEFR)",
    score: "61/100 (C1)",
    date: "Jun 2025",
  },
  {
    name: "British Council EnglishScore",
    score: "578/600 (C1)",
    date: "Jan 2024",
  },
];

const bigFiveScores = [
  { trait: "Openness", value: 89 },
  { trait: "Conscientiousness", value: 33 },
  { trait: "Extraversion", value: 66 },
  { trait: "Agreeableness", value: 25 },
  { trait: "Neuroticism", value: 69 },
];

const discScores = [
  { trait: "Dominance", value: 68 },
  { trait: "Influence", value: 7 },
  { trait: "Steadiness", value: 7 },
  { trait: "Conscientiousness", value: 18 },
];

const cliftonStrengths = [
  "Communication",
  "Arranger",
  "Focus",
  "Restorative",
  "Analytical",
];

const schwartzValues = ["Stimulation", "Self-Direction", "Achievement"];

const hollandCodes = ["IAE", "Investigative", "Artistic", "Enterprising"];

const jungianArchetypes = ["Primary - The Explorer", "Secondary - The Rebel"];

const TOOLS_REMINDER_SEEN_KEY = "my-link-gallery.tools-reminder-seen.v1";

type GroupCard = {
  title: string;
  items: string[];
};

const keySkillsCards: GroupCard[] = [
  { title: "Proficient", items: keySkills.proficient },
  { title: "Fluent", items: keySkills.fluent },
  { title: "Entry-level", items: keySkills.entryLevel },
];

const toolsAndEquipmentCards: GroupCard[] = [
  { title: "Proficient", items: toolsAndEquipment.proficient },
  { title: "Fluent", items: toolsAndEquipment.fluent },
  { title: "Entry-level", items: toolsAndEquipment.entryLevel },
  { title: "Introductory", items: toolsAndEquipment.introductory },
];

const groupBorderGradients = [
  "from-cyan-400/80 via-sky-400/70 to-blue-500/80",
  "from-emerald-400/80 via-lime-400/70 to-yellow-400/80",
  "from-fuchsia-400/80 via-pink-400/70 to-rose-500/80",
  "from-violet-400/80 via-indigo-400/70 to-blue-400/80",
  "from-amber-400/80 via-orange-400/70 to-red-500/80",
  "from-teal-400/80 via-cyan-400/70 to-indigo-500/80",
];

const GroupDeckCard = ({
  card,
  gradientClass,
}: {
  card: GroupCard;
  gradientClass: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <article
      className={`h-full rounded-2xl bg-gradient-to-br ${gradientClass} p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex h-full min-h-[200px] sm:min-h-[240px] flex-col rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {card.title}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {card.items.map((item) => (
            <span
              key={item}
              className="hover-chroma-pill rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs leading-relaxed text-foreground/90 sm:px-3 sm:text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

const PagedGroupedDeck = ({
  cards,
  isActive = false,
}: {
  cards: GroupCard[];
  isActive?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const previousActiveRef = useRef(isActive);
  const totalPages = cards.length;

  useEffect(() => {
    const wasInactive = !previousActiveRef.current;
    previousActiveRef.current = isActive;
    if (isActive && wasInactive) {
      setCurrentPage(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || isHovered || totalPages <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentPage((page) => (page === totalPages - 1 ? 0 : page + 1));
    }, 7000);
    return () => window.clearInterval(interval);
  }, [currentPage, totalPages, isActive, isHovered]);

  const goPrev = () => {
    setCurrentPage((page) => (page === 0 ? totalPages - 1 : page - 1));
  };

  const goNext = () => {
    setCurrentPage((page) => (page === totalPages - 1 ? 0 : page + 1));
  };

  return (
    <div className="w-full">
      <div
        className="group relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setHoverSide(null);
          setIsHovered(false);
        }}
      >
        <div key={currentPage}>
          <GroupDeckCard
            card={cards[currentPage]}
            gradientClass={groupBorderGradients[currentPage % groupBorderGradients.length]}
          />
        </div>

        {totalPages > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous group"
              onMouseEnter={() => setHoverSide("left")}
              onFocus={() => setHoverSide("left")}
              onClick={goPrev}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
            />
            <button
              type="button"
              aria-label="Next group"
              onMouseEnter={() => setHoverSide("right")}
              onFocus={() => setHoverSide("right")}
              onClick={goNext}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
            />

            <div
              className={`pointer-events-none absolute inset-y-0 left-0 z-20 flex w-9 items-center justify-start transition-opacity duration-200 ${hoverSide === "left" ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex h-24 w-9 items-center justify-center rounded-r-full bg-card/90 border border-border border-l-0 shadow-sm">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </div>
            </div>

            <div
              className={`pointer-events-none absolute inset-y-0 right-0 z-20 flex w-9 items-center justify-end transition-opacity duration-200 ${hoverSide === "right" ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex h-24 w-9 items-center justify-center rounded-l-full bg-card/90 border border-border border-r-0 shadow-sm">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to group ${i + 1}`}
              onClick={() => setCurrentPage(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentPage ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const DeckEntryCard = ({
  item,
  label,
  footerText,
  showLogo = true,
}: {
  item: string;
  label: string;
  footerText?: string;
  showLogo?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <article
      className={`h-full rounded-2xl bg-gradient-to-br from-fuchsia-400/80 via-violet-400/70 to-cyan-400/80 p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex h-full min-h-[148px] sm:min-h-[180px] flex-col rounded-2xl border border-border/70 bg-card p-3 sm:p-4">
        <div className="mb-4 flex items-start gap-3">
          {showLogo && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:h-12 sm:w-12 sm:text-[10px] sm:tracking-[0.25em]">
              Logo
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px] sm:tracking-[0.24em]">
              {label}
            </p>
            <h3 className="portrait-card-content-text mt-1 text-xs font-semibold leading-snug text-foreground sm:text-sm">
              {item}
            </h3>
          </div>
        </div>

        {footerText && (
          <div className="portrait-card-content-text mt-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground/60" />
            {footerText}
          </div>
        )}
      </div>
    </article>
  );
};

const PagedCardsDeck = ({
  items,
  label,
  footerText,
  showLogo = true,
  isActive = false,
}: {
  items: string[];
  label: string;
  footerText?: string;
  showLogo?: boolean;
  isActive?: boolean;
}) => {
  const isMobileView = useIsMobile();
  const cardsPerPage = isMobileView ? 4 : 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const previousActiveRef = useRef(isActive);

  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));

  useEffect(() => {
    const wasInactive = !previousActiveRef.current;
    previousActiveRef.current = isActive;

    if (isActive && wasInactive) {
      setCurrentPage(1);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || isHovered || totalPages <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentPage((page) => (page === totalPages ? 1 : page + 1));
    }, 7000);

    return () => window.clearInterval(interval);
  }, [currentPage, totalPages, isActive, isHovered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [totalPages]);

  const visibleCredentials = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return items.slice(start, start + cardsPerPage);
  }, [currentPage, items]);

  const goPrev = () => {
    setCurrentPage((page) => (page === 1 ? totalPages : page - 1));
  };

  const goNext = () => {
    setCurrentPage((page) => (page === totalPages ? 1 : page + 1));
  };

  return (
    <div className="w-full">
      <div
        className="group relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setHoverSide(null);
          setIsHovered(false);
        }}
      >
        <div key={currentPage} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleCredentials.map((item, index) => (
            <DeckEntryCard
              key={`${item}-${currentPage}-${index}`}
              item={item}
              label={label}
              footerText={footerText}
              showLogo={showLogo}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous credentials page"
              onMouseEnter={() => setHoverSide("left")}
              onFocus={() => setHoverSide("left")}
              onClick={goPrev}
              className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
            />
            <button
              type="button"
              aria-label="Next credentials page"
              onMouseEnter={() => setHoverSide("right")}
              onFocus={() => setHoverSide("right")}
              onClick={goNext}
              className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none"
            />

            <div
              className={`pointer-events-none absolute inset-y-0 left-0 z-20 flex w-9 items-center justify-start transition-opacity duration-200 ${hoverSide === "left" ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex h-24 w-9 items-center justify-center rounded-r-full bg-card/90 border border-border border-l-0 shadow-sm">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </div>
            </div>

            <div
              className={`pointer-events-none absolute inset-y-0 right-0 z-20 flex w-9 items-center justify-end transition-opacity duration-200 ${hoverSide === "right" ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex h-24 w-9 items-center justify-center rounded-l-full bg-card/90 border border-border border-r-0 shadow-sm">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ProjectsDeck = ({ isActive }: { isActive: boolean }) => {
  return (
    <PagedCardsDeck
      items={projectItems}
      label="Project"
      showLogo={false}
      isActive={isActive}
    />
  );
};

const HighlightedCredentialsDeck = ({ isActive }: { isActive: boolean }) => {
  return (
    <PagedCardsDeck
      items={highlightedCredentials}
      label="Credential"
      isActive={isActive}
    />
  );
};

const ResumeKeywordPillWall = ({ style }: { style?: CSSProperties }) => {
  return (
    <div className="resume-pill-wall" style={style}>
      {rollingKeywordRows.map((row, rowIndex) => {
        const duration = 48 + rowIndex * 2;

        return (
          <div key={`row-${rowIndex}`} className="resume-pill-row">
            <div
              className={`resume-pill-track ${rowIndex % 2 === 1 ? "resume-pill-track-reverse" : ""}`}
              style={{ animationDuration: `${duration}s` }}
            >
              {[...row, ...row].map((item, itemIndex) => (
                <span key={`${rowIndex}-${itemIndex}-${item}`} className="resume-keyword-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};



const RadialIntensityGrid = ({
  items,
  tone,
}: {
  items: Array<{ trait: string; value: number }>;
  tone: string;
}) => {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const currentValue = item.value;
        const endDeg = currentValue * 3.6;

        return (
          <div
            key={item.trait}
            className="hover-chroma-border rounded-xl border border-border/70 bg-card/60 px-2 py-2"
          >
            <div
              className="mx-auto h-14 w-14 rounded-full p-[3px]"
              style={{
                background: `conic-gradient(${tone} ${endDeg}deg, hsl(var(--secondary)) ${endDeg}deg 360deg)`,
              }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-[11px] font-semibold text-foreground">
                {currentValue}%
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] font-medium leading-tight text-foreground/95">
              {item.trait}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default function Resume() {
  const sectionRefs = useRef<HTMLElement[]>([]);
  const overviewHeroRef = useRef<HTMLDivElement | null>(null);
  const overviewCardsRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isToolsReminderOpen, setIsToolsReminderOpen] = useState(false);
  const [shouldShowToolsReminder, setShouldShowToolsReminder] = useState(false);
  const [overviewWallMetrics, setOverviewWallMetrics] = useState({
    height: 0,
    offsetTop: 0,
  });
  const isMobile = useIsMobile();
  const [summaryModalPage, setSummaryModalPage] = useState<typeof resumePages[0] | null>(null);
  const [showBigFiveModal, setShowBigFiveModal] = useState(false);
  const [showDiscModal, setShowDiscModal] = useState(false);

  useEffect(() => {
    try {
      const hasSeenReminder = window.localStorage.getItem(TOOLS_REMINDER_SEEN_KEY) === "1";
      setShouldShowToolsReminder(!hasSeenReminder);
    } catch {
      setShouldShowToolsReminder(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.find((entry) => entry.isIntersecting);

        if (activeEntry?.target instanceof HTMLElement) {
          setActiveSectionId(activeEntry.target.id);
        }
      },
      {
        threshold: 0.6,
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const recalculateOverviewWall = () => {
      if (!overviewHeroRef.current || !overviewCardsRef.current) {
        return;
      }

      const heroRect = overviewHeroRef.current.getBoundingClientRect();
      const cardsRect = overviewCardsRef.current.getBoundingClientRect();
      const offsetTop = Math.max(0, cardsRect.top - heroRect.top);
      const height = Math.max(0, cardsRect.bottom - heroRect.top - 5);

      setOverviewWallMetrics({
        height,
        offsetTop,
      });
    };

    const frame = window.requestAnimationFrame(recalculateOverviewWall);
    const resizeObserver = new ResizeObserver(recalculateOverviewWall);

    if (overviewHeroRef.current) {
      resizeObserver.observe(overviewHeroRef.current);
    }

    if (overviewCardsRef.current) {
      resizeObserver.observe(overviewCardsRef.current);
    }

    window.addEventListener("resize", recalculateOverviewWall);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", recalculateOverviewWall);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsToolsOpen(false);
        setIsToolsReminderOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative isolate h-screen min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div
        className={`absolute inset-0 z-10 transition-all duration-300 ${
          isToolsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ResumeToolsPanel isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
      </div>

      <Dialog open={isToolsReminderOpen} onOpenChange={setIsToolsReminderOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Welcome to Tools</DialogTitle>
            <DialogDescription>
              Press <span className="font-medium text-foreground">Escape</span> to go back to home.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              Carlos loved learning, but staying focused wasn't always easy. One day he found a simple rhythm: short bursts of study, gentle lofi beats, and calm breaks. Studying suddenly felt lighter and clearer. Now it's your turn to step into that same flow.
            </p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsToolsReminderOpen(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`relative z-20 flex h-full min-h-0 flex-col bg-transparent transition-transform duration-500 ease-out ${isToolsOpen ? "translate-x-full" : "translate-x-0"}`}>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
          <h1 className="text-base font-semibold text-foreground md:text-xl">Resume</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/resume-builder"
              className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
            >
              Build your own
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>


      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
        {resumePages.map((page, index) => {
          const showSidePanel = !page.noCard && page.id !== "projects" && index !== 0 && index !== resumePages.length - 1;

          return (
          <section
            key={page.id}
            id={page.id}
            ref={(section) => {
              if (section) {
                sectionRefs.current[index] = section;
              }
            }}
            className={"snap-start snap-always min-h-full border-b border-border"}
          >
            <div className="container mx-auto flex min-h-full items-center px-4 pt-12 pb-24 md:py-12">
              <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_1.15fr_0.7fr] lg:grid-rows-[auto_1fr]">
                <div
                  className="min-w-0 lg:col-span-3"
                  ref={(node) => {
                    if (page.id === "overview") {
                      overviewHeroRef.current = node;
                    }
                  }}
                >
                  <h1 className="max-w-4xl pb-1 text-2xl font-bold leading-tight sm:text-3xl md:text-6xl">
                    {page.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base md:text-lg">{page.subtitle}</p>
                </div>

                <div
                    className={`min-w-0 md:min-h-[330px] ${showSidePanel ? "lg:col-span-2" : "lg:col-span-3"}`}
                >
                  {page.id === "overview" ? (
                    <div className="resume-overview-columns">
                      <div ref={overviewCardsRef} className="space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
                        {overviewDetails.map((item) => {
                          const Icon = item.icon;

                          return (
                            <div key={item.text} className="hover-chroma-border flex items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
                              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                              <p>{item.text}</p>
                            </div>
                          );
                        })}
                      </div>
                      <ResumeKeywordPillWall
                        style={{
                          marginTop: `-${overviewWallMetrics.offsetTop}px`,
                          marginLeft: "40px",
                          width: "calc(100% - 96px)",
                          height: `${overviewWallMetrics.height}px`,
                        }}
                      />
                    </div>
                  ) : page.id === "projects" ? (
                    <ProjectsDeck isActive={activeSectionId === page.id} />
                  ) : page.id === "other-working-experience" ? (
                    <div className="grid gap-4">
                      {otherWorkingExperiences.map((experience) => (
                        <article
                          key={experience.title}
                          className="hover-chroma-border rounded-2xl border border-border/70 bg-card p-4 md:p-5"
                        >
                          <h3 className="text-lg font-semibold text-foreground md:text-xl">
                            {experience.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground md:text-base">
                            {experience.subtitle}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {experience.tags.map((tag) => (
                              <span
                                key={tag}
                                className="hover-chroma-pill rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : page.id === "education-honors" ? (
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Education
                        </h3>
                        <div className="space-y-4 text-foreground/95">
                          {educationDetails
                            .filter(
                              (item) =>
                                item.institution || item.degree || item.period || item.grade || item.focus
                            )
                            .map((item, index) => (
                              <div key={`${item.institution}-${item.degree}-${index}`} className="space-y-2">
                                <p className="text-lg font-semibold">{item.institution}</p>
                                <p className="text-base">{item.degree}</p>
                                <p className="text-sm text-muted-foreground">{item.period}</p>
                                <p className="text-sm text-muted-foreground">{item.grade}</p>
                                <p className="text-sm text-muted-foreground">{item.focus}</p>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Honors & awards
                        </h3>
                        <div className="space-y-5">
                          {honorsAndAwards.map((award) => (
                            <div key={award.title} className="space-y-1">
                              <p className="text-base font-semibold text-foreground/95">{award.title}</p>
                              <p className="text-sm text-muted-foreground">{award.issuer}</p>
                              <p className="text-sm text-foreground/85">{award.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : page.id === "key-skills" ? (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Key Skills</p>
                        <PagedGroupedDeck cards={keySkillsCards} isActive={activeSectionId === "key-skills"} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tools and Equipment</p>
                        <PagedGroupedDeck cards={toolsAndEquipmentCards} isActive={activeSectionId === "key-skills"} />
                      </div>
                    </div>
                  ) : page.id === "contact" ? (
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Contact Channels
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {contactChannels.map((channel) => (
                            <a
                              key={channel.label}
                              href={channel.href}
                              target={channel.href.startsWith("http") ? "_blank" : undefined}
                              rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className={`hover-chroma-pill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 ${channel.className}`}
                            >
                              <span className="opacity-80">{channel.label}</span>
                              <span className="text-foreground/85">{channel.value}</span>
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Partnership
                          </p>
                          <div className="space-y-1 text-sm text-foreground/95">
                            <p>Microsoft Solution Partner - CSP</p>
                            <p>Bitdefender Bronze Partner</p>
                            <p>Veeam ProPartner</p>
                            <p>Acronis Partner</p>
                            <p>Snowflake Partner Network</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Inquiries?
                          </p>
                          <div className="space-y-1 text-sm text-foreground/95">
                            <p>
                              email{" "}
                              <a
                                href="mailto:carlosgeraldine@bersama365.work.gd"
                                className="underline decoration-border underline-offset-4 hover:opacity-80"
                              >
                                carlosgeraldine@bersama365.work.gd
                              </a>
                            </p>
                            <p>
                              whatsapp{" "}
                              <a
                                href="https://wa.me/6285770078016"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-border underline-offset-4 hover:opacity-80"
                              >
                                6285770078016
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : page.id === "linguistic-psychometrics" ? (
                    <div className="grid gap-8 lg:grid-cols-2">
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Language
                          </p>
                          <div className="mt-3 space-y-3">
                            {linguisticScores.map((item) => (
                              <div key={item.name} className="space-y-1 border-b border-border/60 pb-2">
                                <p className="text-sm font-semibold text-foreground/95">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {item.score} - {item.date}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Profile
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              MBTI
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                ENTP - Debater
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Extroverted
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Intuitive
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Thinking
                              </span>
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Perceiving
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Enneagram
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                                Type 3 - The Achiever
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Holland Code/RIASEC
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {hollandCodes.map((item) => (
                                <span
                                  key={item}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Jungian Archetype Assessment
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {jungianArchetypes.map((item) => (
                                <span
                                  key={item}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Top 3 Schwartz's Core Values
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {schwartzValues.map((value) => (
                                <span
                                  key={value}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Top 5 CliftonStrengths
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {cliftonStrengths.map((item) => (
                                <span
                                  key={item}
                                  className="hover-chroma-pill rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isMobile ? (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setShowBigFiveModal(true)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/80"
                          >
                            <span>Big Five Assessment</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDiscModal(true)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/80"
                          >
                            <span>DISC</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Big Five Assessment
                            </p>
                            <RadialIntensityGrid
                              items={bigFiveScores}
                              tone="hsl(var(--foreground))"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              DISC
                            </p>
                            <RadialIntensityGrid
                              items={discScores}
                              tone="hsl(var(--primary))"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : page.id === "highlighted-credentials" ? (
                    <HighlightedCredentialsDeck isActive={activeSectionId === page.id} />
                  ) : (
                    <div className="space-y-4 pr-1 text-lg leading-relaxed text-foreground/90">
                      {page.body.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>

                {showSidePanel && (
                  isMobile ? (
                    <button
                      type="button"
                      onClick={() => setSummaryModalPage(page)}
                      className="self-start inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/80"
                    >
                      <span>Show Summary</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </button>
                  ) : (
                    <div className={`h-full min-h-[260px] rounded-[1.25rem] border bg-card p-4 shadow-sm md:p-5 ${page.borderClass}`}>
                      <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-background p-3 md:p-4">
                        <p className="text-sm font-semibold">Summary</p>
                        <p className="mt-3 border-l border-border/70 pl-3 text-[19px] italic leading-relaxed text-muted-foreground/90">
                          {page.summary}
                        </p>

                        <div className="mt-auto pt-4 flex flex-wrap gap-2">
                          {page.highlights.map((item) => (
                            <span
                              key={item}
                              className="hover-chroma-pill rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
          );
        })}
      </main>

      <Dialog open={showBigFiveModal} onOpenChange={setShowBigFiveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Big Five Assessment</DialogTitle>
          </DialogHeader>
          <RadialIntensityGrid items={bigFiveScores} tone="hsl(var(--foreground))" />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowBigFiveModal(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscModal} onOpenChange={setShowDiscModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>DISC</DialogTitle>
          </DialogHeader>
          <RadialIntensityGrid items={discScores} tone="hsl(var(--primary))" />
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowDiscModal(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            <Dialog open={summaryModalPage !== null} onOpenChange={(open) => { if (!open) setSummaryModalPage(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="border-l-2 border-border pl-3 text-base italic leading-relaxed text-muted-foreground">
              {summaryModalPage?.summary}
            </p>
            {summaryModalPage?.highlights && summaryModalPage.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {summaryModalPage.highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setSummaryModalPage(null)}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            <button
        type="button"
        aria-label="Tools"
        onClick={() => {
          setIsToolsOpen(true);

          if (shouldShowToolsReminder) {
            setIsToolsReminderOpen(true);
            setShouldShowToolsReminder(false);

            try {
              window.localStorage.setItem(TOOLS_REMINDER_SEEN_KEY, "1");
            } catch {
              // Ignore storage failures and allow session-only behavior.
            }
          }
        }}
        className={`hidden md:inline-flex fixed bottom-4 left-4 z-40 select-none text-5xl font-bold leading-none tracking-tight text-foreground transition-all duration-300 origin-bottom-left hover:scale-110 md:bottom-6 md:left-6 md:text-7xl ${
          isToolsOpen ? "opacity-100" : "opacity-25"
        }`}
      >
        ← tools
      </button>

      <Link
        to="/links"
        aria-label="Links"
        className={`hidden md:inline-flex fixed bottom-4 right-4 z-40 select-none text-5xl font-bold leading-none tracking-tight text-foreground transition-all duration-300 origin-bottom-right hover:scale-110 md:bottom-6 md:right-6 md:text-7xl ${
          activeSectionId === "contact" ? "opacity-100" : "opacity-25"
        }`}
      >
        links →
      </Link>

      <div
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-2.5 md:hidden"
        style={{
          paddingBottom: "calc(0.9rem + env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          aria-label="Tools"
          onClick={() => {
            setIsToolsOpen(true);
            if (shouldShowToolsReminder) {
              setIsToolsReminderOpen(true);
              setShouldShowToolsReminder(false);
              try {
                window.localStorage.setItem(TOOLS_REMINDER_SEEN_KEY, "1");
              } catch {}
            }
          }}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-3 py-2 text-lg font-semibold text-foreground transition-colors hover:bg-background mx-1"
        >
          Tools
        </button>
        <Link
          to="/links"
          aria-label="Links"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-3 py-2 text-lg font-semibold text-foreground transition-colors hover:bg-background mx-1"
        >
          Links
        </Link>
      </div>
      </div>
    </div>
  );
};

