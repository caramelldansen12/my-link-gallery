import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const initializeThemeMode = () => {
        const savedTheme = localStorage.getItem("theme");
        const themeMode = savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "system";
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldUseDark = themeMode === "dark" || (themeMode === "system" && prefersDark);

        document.documentElement.classList.toggle("dark", shouldUseDark);

        if (savedTheme === null) {
                localStorage.setItem("theme", "system");
        }
};

const setupHoverBorderPointerTracking = () => {
        const explicitGlowSelector = ".hover-chroma-border, .hover-chroma-pill";
        const pillSelector = ".hover-chroma-pill";
        const borderSelector = ".hover-chroma-border, [class~='border'], [class*=' border-'], [class^='border-']";
        const hoverGlowSelector = `${pillSelector}, ${borderSelector}`;
        const glowRadius = 128;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

        if (prefersReducedMotion || isCoarsePointer) {
                return;
        }

        let hasPointer = false;
        let pointerX = 0;
        let pointerY = 0;
        let frameId = 0;
        let activeElements = new Set<HTMLElement>();

        const clearGlowProps = (element: HTMLElement) => {
                element.style.removeProperty("--hb-x");
                element.style.removeProperty("--hb-y");
                element.style.removeProperty("--hb-opacity");
        };

        const isEligibleGlowElement = (element: HTMLElement) => {
                if (element.matches(explicitGlowSelector)) {
                        return true;
                }

                if (element.matches(pillSelector)) {
                        return true;
                }

                if (!element.matches(borderSelector)) {
                        return false;
                }

                const nearestBorderAncestor = element.parentElement?.closest(borderSelector);
                return !nearestBorderAncestor;
        };

        const applyPointerPosition = () => {
                frameId = 0;

                if (!hasPointer) {
                        activeElements.forEach(clearGlowProps);
                        activeElements = new Set<HTMLElement>();
                        return;
                }

                const nextActiveElements = new Set<HTMLElement>();
                document.querySelectorAll<HTMLElement>(hoverGlowSelector).forEach((element) => {
                        if (!isEligibleGlowElement(element)) {
                                return;
                        }

                        const rect = element.getBoundingClientRect();

                        if (rect.width === 0 || rect.height === 0) {
                                return;
                        }

                        const nearestX = Math.min(Math.max(pointerX, rect.left), rect.right);
                        const nearestY = Math.min(Math.max(pointerY, rect.top), rect.bottom);
                        const distanceX = pointerX - nearestX;
                        const distanceY = pointerY - nearestY;
                        const distance = Math.hypot(distanceX, distanceY);

                        if (distance > glowRadius) {
                                return;
                        }

                        const opacity = 1 - distance / glowRadius;

                        if (opacity <= 0) {
                                return;
                        }

                        element.style.setProperty("--hb-x", `${pointerX - rect.left}px`);
                        element.style.setProperty("--hb-y", `${pointerY - rect.top}px`);
                        element.style.setProperty("--hb-opacity", opacity.toFixed(3));
                        nextActiveElements.add(element);
                });

                activeElements.forEach((element) => {
                        if (!nextActiveElements.has(element)) {
                                clearGlowProps(element);
                        }
                });

                activeElements = nextActiveElements;
        };

        const queuePointerUpdate = () => {
                if (frameId) {
                        return;
                }

                frameId = window.requestAnimationFrame(applyPointerPosition);
        };

        const clearActiveCard = () => {
                hasPointer = false;
                queuePointerUpdate();
        };

        document.addEventListener(
                "pointermove",
                (event) => {
                        hasPointer = true;
                        pointerX = event.clientX;
                        pointerY = event.clientY;
                        queuePointerUpdate();
                },
                { passive: true }
        );

        document.addEventListener("pointerleave", clearActiveCard, { passive: true });
        document.addEventListener("scroll", queuePointerUpdate, { passive: true, capture: true });
        window.addEventListener("resize", queuePointerUpdate, { passive: true });
        window.addEventListener("blur", clearActiveCard);
};

setupHoverBorderPointerTracking();
initializeThemeMode();

createRoot(document.getElementById("root")!).render(<App />);
