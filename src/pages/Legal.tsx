import { FileText, Scale, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import MonochromePlusBackground from "@/components/MonochromePlusBackground";

const effectiveDate = "April 7, 2026";

const Legal = () => {
  return (
    <>
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <MonochromePlusBackground />
      <div className="page-base-glass" aria-hidden="true" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
            <div className="flex min-w-0 items-center gap-2">
              <Scale className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-base font-semibold text-foreground md:text-xl">Legal</h1>
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Combined legal page</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">Privacy, License, and Terms</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">Effective date: {effectiveDate}</p>
          </section>

          <section className="space-y-4">
            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground md:text-xl">Privacy Notice</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">This website is a front-end static application and does not run a backend service for account registration.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Theme preferences and selected local settings may be stored in your browser localStorage for usability.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Publish features use your GitHub token only in-memory for the active session and do not intentionally persist tokens in storage.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">By using publish actions, you authorize requests to GitHub APIs under your provided token permissions.</li>
              </ul>
            </article>

            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground md:text-xl">License Notice (GNU AGPL v3)</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">This project is distributed under the GNU Affero General Public License version 3 (AGPL-3.0).</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">If you modify and run this software over a network, you must make the complete corresponding source available under AGPL-3.0.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Redistributions and derivative works must keep copyright notices and license terms.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                  Full license text: <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:opacity-80">https://www.gnu.org/licenses/agpl-3.0.html</a>
                </li>
              </ul>
            </article>

            <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground md:text-xl">Terms and Conditions</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">Use this site and generated outputs at your own risk. The software is provided "as is" without warranties.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">You are responsible for your own GitHub token usage, repository permissions, and resulting commits/deployments.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">You agree not to use this application for unlawful activities or to violate third-party rights.</li>
                <li className="rounded-2xl border border-border/70 bg-background px-4 py-3">These terms may be updated in future releases, and continued use indicates acceptance of the current version.</li>
              </ul>
            </article>
          </section>
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

export default Legal;
