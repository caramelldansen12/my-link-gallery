import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Resume from "./pages/Resume.tsx";
import ResumeBuilder from "./pages/ResumeBuilder.tsx";
import LinkBuilder from "./pages/LinkBuilder.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const ATTRIBUTION_LEAD = "Originally made by Carlos R. Geraldine ☆ ";
export const ATTRIBUTION_URL = "https://github.com/carlosrichardgeraldine/my-link-gallery";
export const ATTRIBUTION_TEXT = `${ATTRIBUTION_LEAD}${ATTRIBUTION_URL}`;
export const ATTRIBUTION_MARK = "𖤐";
const ATTRIBUTION_FOOTER_ID = "origin-attribution-footer";
const OWNER_NAME = "Carlos Richard Geraldine";

const routeTitles: Record<string, string> = {
  "/": "Resume",
  "/resume": "Resume",
  "/links": "Links",
  "/resume-builder": "Resume Builder",
  "/links-builder": "Links Builder",
};

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = routeTitles[location.pathname] ?? "";
    document.title = pageName ? `${OWNER_NAME} | ${pageName}` : OWNER_NAME;
  }, [location.pathname]);

  return null;
};

export const AttributionFooter = () => {
  const [integrityTick, setIntegrityTick] = useState(0);

  useEffect(() => {
    const isCompromised = () => {
      const footer = document.getElementById(ATTRIBUTION_FOOTER_ID);

      if (!footer) {
        return true;
      }

      const text = footer.textContent?.trim() ?? "";
      const mark = footer.getAttribute("data-origin-mark");

      return text !== ATTRIBUTION_TEXT || mark !== ATTRIBUTION_MARK;
    };

    const observer = new MutationObserver(() => {
      if (isCompromised()) {
        setIntegrityTick((current) => current + 1);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-origin-mark"],
    });

    if (isCompromised()) {
      setIntegrityTick((current) => current + 1);
    }

    return () => {
      observer.disconnect();
    };
  }, [integrityTick]);

  return (
    <p
      id={ATTRIBUTION_FOOTER_ID}
      key={integrityTick}
      data-origin-mark={ATTRIBUTION_MARK}
      data-testid="attribution-footer"
      className="fixed inset-x-0 bottom-2 z-[2147483647] text-center text-[11px] font-medium text-muted-foreground/90"
    >
      {ATTRIBUTION_LEAD}
      <a
        href={ATTRIBUTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto underline decoration-muted-foreground/70 underline-offset-2 hover:text-foreground"
      >
        {ATTRIBUTION_URL}
      </a>
    </p>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative">
          <TitleManager />
          <Routes>
            <Route path="/" element={<Resume />} />
            <Route path="/links" element={<Index />} />
            <Route path="/resume" element={<Navigate to="/" replace />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/links-builder" element={<LinkBuilder />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <AttributionFooter />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
