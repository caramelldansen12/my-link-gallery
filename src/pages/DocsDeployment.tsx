import { Cloud, ExternalLink, Globe, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const deploymentPaths = [
  {
    title: "I already use Azure Static Web Apps",
    description:
      "Keep Azure deployments on the upstream repository. Forks skip Azure workflows to avoid missing secret failures. Builder publish commits directly to the deployment branch and starts CI/CD immediately.",
    icon: ShieldCheck,
    steps: [
      "Push to main on the upstream repository to trigger Azure deploy.",
      "Use pull requests for preview environments when needed.",
      "Publish from Resume Builder or Links Builder to trigger deployment automatically with no merge step.",
      "Keep AZURE_STATIC_WEB_APPS_API_TOKEN configured only in upstream secrets.",
    ],
  },
  {
    title: "I want to set up Azure for the first time",
    description:
      "Provision a Static Web App in Azure, connect the repository, and add the generated deployment token in repository secrets.",
    icon: Cloud,
    steps: [
      "Create a Static Web App resource in Azure Portal.",
      "Link the upstream repository and confirm build path settings.",
      "Add the generated token to GitHub repository secrets and deploy.",
    ],
  },
  {
    title: "I do not use Azure",
    description:
      "Fork repositories deploy with GitHub Pages automatically using the fork-safe workflow and no Azure account required.",
    icon: Globe,
    steps: [
      "Enable GitHub Pages with Source set to GitHub Actions.",
      "Push to main in your fork to trigger the GitHub Pages workflow.",
      "Open your published URL and validate routing and static assets.",
    ],
  },
];

const DocsDeployment = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Cloud className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Deployment</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/docs"
                className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card md:text-sm"
              >
                Back to Docs
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Decision guide</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Choose your publish path</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              This project supports a dual deployment model: Azure Static Web Apps for upstream and GitHub Pages for forks.
              Pick the path that matches your setup and follow the checklist. Resume Builder and Links Builder publish
              both commit directly to the deployment branch and trigger CI/CD immediately.
            </p>
          </section>

          <section className="space-y-4">
            {deploymentPaths.map((path) => {
              const Icon = path.icon;

              return (
                <article key={path.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground md:text-xl">{path.title}</h3>
                      </div>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{path.description}</p>
                    </div>
                  </div>

                  <ol className="mt-4 space-y-2">
                    {path.steps.map((step, index) => (
                      <li
                        key={step}
                        className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground md:text-base"
                      >
                        <span className="font-medium text-foreground">Step {index + 1}:</span> {step}
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </section>

          <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground md:text-xl">Useful references</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://learn.microsoft.com/azure/static-web-apps/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                Azure Static Web Apps docs
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://docs.github.com/pages"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                GitHub Pages docs
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsDeployment;
