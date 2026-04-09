import { ChevronDown, ChevronUp } from "lucide-react";

interface ResumePageNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

const ResumePageNavigation = ({
  onPrevious,
  onNext,
  isAtStart,
  isAtEnd,
}: ResumePageNavigationProps) => {
  return (
    <div className="hidden md:flex fixed left-4 top-1/2 z-40 -translate-y-1/2 flex-col gap-2 md:left-6">
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous page"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isAtStart}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next page"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isAtEnd}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ResumePageNavigation;
