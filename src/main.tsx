import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const setupHoverBorderPointerTracking = () => {
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

	if (prefersReducedMotion || isCoarsePointer) {
		return;
	}

	let activeCard: HTMLElement | null = null;
	let nextCard: HTMLElement | null = null;
	let nextX = 0;
	let nextY = 0;
	let frameId = 0;

	const applyPointerPosition = () => {
		frameId = 0;

		if (!nextCard) {
			if (activeCard) {
				activeCard.style.removeProperty("--hb-x");
				activeCard.style.removeProperty("--hb-y");
				activeCard = null;
			}
			return;
		}

		if (activeCard && activeCard !== nextCard) {
			activeCard.style.removeProperty("--hb-x");
			activeCard.style.removeProperty("--hb-y");
		}

		const rect = nextCard.getBoundingClientRect();
		nextCard.style.setProperty("--hb-x", `${nextX - rect.left}px`);
		nextCard.style.setProperty("--hb-y", `${nextY - rect.top}px`);
		activeCard = nextCard;
	};

	const queuePointerUpdate = () => {
		if (frameId) {
			return;
		}

		frameId = window.requestAnimationFrame(applyPointerPosition);
	};

	const clearActiveCard = () => {
		nextCard = null;
		if (!activeCard && !frameId) {
			return;
		}
		queuePointerUpdate();
	};

	document.addEventListener(
		"pointermove",
		(event) => {
			const target = event.target as Element | null;
			const card = target?.closest(".hover-chroma-border") as HTMLElement | null;

			if (!card) {
				clearActiveCard();
				return;
			}

			nextCard = card;
			nextX = event.clientX;
			nextY = event.clientY;
			queuePointerUpdate();
		},
		{ passive: true }
	);

	document.addEventListener("pointerleave", clearActiveCard, { passive: true });
	window.addEventListener("blur", clearActiveCard);
};

setupHoverBorderPointerTracking();

createRoot(document.getElementById("root")!).render(<App />);
