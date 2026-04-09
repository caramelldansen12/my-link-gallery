import { ArrowRight, BookOpen, LayoutGrid, Route, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const docsSections = [
  {
    title: "Overview",
    body:
      "My Link Gallery is a front-end-only Vite + React application for a personal link hub, a resume page, and an in-browser resume builder. It relies on static data, local browser state, and generated files instead of a backend.",
  },
  {
    title: "Architecture",
    body:
      "Pages act as orchestration shells, while feature modules contain the reusable editor logic. This keeps the larger surfaces thin and makes the domain-specific pieces easier to maintain.",
  },
  {
    title: "Routes",
    body:
      "The app exposes the resume page, link gallery, resume builder, link builder, and documentation page. Unknown routes fall back to the 404 page.",
  },
  {
    title: "Data Flow",
    body:
      "Link content and resume-builder defaults live in src/data. The resume builder edits an in-memory copy of that data and can download a generated Resume.tsx file.",
  },
  {
    title: "Development",
    body:
      "Use npm for the workflow: npm install, npm run dev, npm run build, npm run lint, and npm run test.",
  },
  {
    title: "Deployment",
    body:
      "Choose the right publishing path for your setup: keep Azure Static Web Apps on upstream, configure Azure first-time setup, or use GitHub Pages in a fork with no Azure dependency. Resume Builder and Links Builder publish both commit directly and trigger deployment immediately.",
  },
  {
    title: "Notes",
    body:
      "Theme and background preferences are persisted in localStorage. The app is entirely client-side and does not write changes back to the workspace automatically.",
  },
  {
    title: "UI/UX",
    body:
      "The interface follows shared page-shell patterns, card-based sections, and semantic theme tokens. Reusable UI primitives live under src/components/ui while feature-level composition is handled in page and feature modules.",
  },
  {
    title: "Visual Components",
    body:
      "A complete visual component catalog is available in docs, including project-specific UI elements, installed UI primitives, and credits for the libraries and creators behind them.",
  },
  {
    title: "Legal",
    body:
      "A combined legal page is available for Privacy Notice, AGPL 3.0 License notice, and Terms and Conditions, including first-visit agreement flow.",
  },
];

const quickLinks = [
  { label: "Resume", href: "/", icon: Route },
  { label: "Links", href: "/links", icon: LayoutGrid },
  { label: "Resume Builder", href: "/resume-builder", icon: Sparkles },
  { label: "Link Builder", href: "/links-builder", icon: Sparkles },
];

const docsContents = [
  {
    title: "Overview Manual",
    href: "/docs/overview-manual",
  },
  {
    title: "Architecture",
    href: "/docs/architecture",
  },
  {
    title: "Routes",
    href: "/docs/routes",
  },
  {
    title: "Data Flow",
    href: "/docs/data-flow",
  },
  {
    title: "Development",
    href: "/docs/development",
  },
  {
    title: "Deployment",
    href: "/docs/deployment",
  },
  {
    title: "Notes",
    href: "/docs/notes",
  },
  {
    title: "UI/UX",
    href: "/docs/ui-ux",
  },
  {
    title: "Visual Components",
    href: "/docs/visual-components",
  },
  {
    title: "Legal",
    href: "/legal",
  },
];

const Docs = () => {
  return (
    <>
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Documentation</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
              >
                Back to Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">High-level documentation</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">My Link Gallery</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Starting from architecture and core behavior so contributors can quickly understand the app before diving into feature-level editors.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </section>

          <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="space-y-4">
              {docsSections.map((section) => (
                <article key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground md:text-xl">{section.title}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{section.body}</p>
                </article>
              ))}
            </section>

            <aside className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contents</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Documentation index for current and planned deep-dive pages.
              </p>

              <div className="space-y-2">
                {docsContents.map((item) =>
                  item.href ? (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="block rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-card"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ) : (
                    <div key={item.title} className="rounded-2xl border border-border/70 bg-background px-4 py-3 opacity-70">
                      <div className="text-sm font-medium text-foreground">{item.title}</div>
                    </div>
                  )
                )}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>

    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center border-t border-border bg-background/95 px-2 py-1.5 md:hidden"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      <Link
        to="/"
        className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-2 py-1 text-base font-semibold text-foreground transition-colors hover:bg-background mx-1"
      >
        Back to Home
      </Link>
    </div>
    </>
  );
};

export default Docs;
