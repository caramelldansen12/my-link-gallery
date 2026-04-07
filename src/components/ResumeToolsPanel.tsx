import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Pause, Play, SkipForward, Square, Volume2, VolumeX, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Checkbox } from "@/components/ui/checkbox";
import ThemeToggle from "@/components/ThemeToggle";

const TODO_COOKIE_KEY = "resume_tools_todos";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

const readCookie = (name: string) => {
  const key = `${name}=`;
  const parts = document.cookie.split(";");

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (part.startsWith(key)) {
      return decodeURIComponent(part.slice(key.length));
    }
  }

  return "";
};

const saveSessionCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
};

const timerPresets = [
  {
    id: "classic",
    label: "25 min focus / 5 min break",
    description: "The classic Pomodoro cycle - ideal for most tasks.",
    focusMinutes: 25,
    breakMinutes: 5,
  },
  {
    id: "deep-work",
    label: "50 min focus / 10-17 min break",
    description: "Known as the 52/17 or 50/10 method - great for deep work.",
    focusMinutes: 50,
    breakMinutes: 10,
  },
  {
    id: "study",
    label: "45 min focus / 15 min break",
    description: "Popular for study sessions and warm-up deep work.",
    focusMinutes: 45,
    breakMinutes: 15,
  },
  {
    id: "flex",
    label: "30 min focus / 5 min break",
    description: "A lighter, more flexible block for moderate tasks.",
    focusMinutes: 30,
    breakMinutes: 5,
  },
  {
    id: "sprint",
    label: "15-20 min focus / 3-5 min break",
    description: "Short sprints for quick tasks or low-energy moments.",
    focusMinutes: 15,
    breakMinutes: 3,
  },
] as const;

const breakStartMessages = [
  "Nice job, take a soft little pause.",
  "Great focus, enjoy a quick breather.",
  "Well done, let your mind stretch for a moment.",
  "You made progress, now rest for a bit.",
  "Good work, take a gentle break.",
  "Solid effort, give yourself a moment of ease.",
  "You showed up well, enjoy this short pause.",
  "Nice session, let your thoughts settle for a minute.",
  "You did great, take a light break.",
  "Good flow, now let yourself unwind briefly.",
] as const;

const focusResumeMessages = [
  "Welcome back, your momentum is waiting for you.",
  "Let's slip gently into focus again.",
  "You're doing great, let's keep the flow going.",
  "Ready when you are, your next step is right here.",
  "A fresh breath, a fresh start. Let's continue.",
  "You've got this, one calm session at a time.",
  "Back to the rhythm, steady and smooth.",
  "Your focus is warming up again, let's follow it.",
  "Here we go, another small step forward.",
  "Let's return to the quiet groove you built.",
] as const;

const cycleEndMessages = [
  "Nice work today, take a breath and enjoy the pause.",
  "Session complete, you've earned a moment of calm.",
  "Well done, let your mind rest for a bit.",
  "Great focus, now give yourself some ease.",
  "You showed up beautifully, time to unwind.",
  "Another step forward, now relax your shoulders.",
  "Good progress, let the quiet settle in.",
  "You did your part, now let the world slow down.",
  "Solid session, enjoy the space you've created.",
  "Nice effort, let yourself drift into a soft break.",
] as const;

const pickRandomMessage = (messages: readonly string[]) =>
  messages[Math.floor(Math.random() * messages.length)] ?? "";

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const spotifyFullPlaylists = [
  {
    id: "trap-mojito",
    label: "Trap Mojito",
    uri: "spotify:playlist:37i9dQZF1DX1OIMC8iDi74",
    embedSrc: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1OIMC8iDi74?utm_source=generator&theme=0",
  },
  {
    id: "rocktronic",
    label: "Rocktronic",
    uri: "spotify:playlist:37i9dQZF1DWTfrr8pte1rT",
    embedSrc: "https://open.spotify.com/embed/playlist/37i9dQZF1DWTfrr8pte1rT?utm_source=generator&theme=0",
  },
  {
    id: "alternative-beats",
    label: "Alternative Beats",
    uri: "spotify:playlist:37i9dQZF1DWTfrr8pte1rT",
    embedSrc: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXMg4uP5o3dm?utm_source=generator&theme=0",
  },
  {
    id: "hard-techno",
    label: "Hard Techno",
    uri: "spotify:playlist:37i9dQZF1DWXCzcvFxzeno",
    embedSrc: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXCzcvFxzeno?utm_source=generator",
  },
  {
    id: "rave",
    label: "Rave",
    uri: "spotify:playlist:37i9dQZF1DWXCzcvFxzeno",
    embedSrc: "https://open.spotify.com/embed/playlist/37i9dQZF1DWSXMERUaiq9M?utm_source=generator",
  },
  {
    id: "party-hits-2010s",
    label: "Party Hits 2010s",
    uri: "spotify:playlist:37i9dQZF1DWWylYLMvjuRG",
    embedSrc: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWylYLMvjuRG?utm_source=generator",
  },
] as const;

type SpotifyFullPlaylistId = (typeof spotifyFullPlaylists)[number]["id"];

interface ResumeToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SpotifyPlayerId = "compact" | "full";

interface SpotifyPlaybackState {
  isPaused: boolean;
  isStopped: boolean;
  duration: number;
  position: number;
}

interface SpotifyPlaybackUpdateEvent {
  data: Record<string, unknown>;
}

interface SpotifyPlaybackStartedEvent {
  data: Record<string, unknown>;
}

interface SpotifyEmbedController {
  addListener: (
    event: "ready" | "playback_started" | "playback_update",
    listener: (event?: SpotifyPlaybackUpdateEvent | SpotifyPlaybackStartedEvent) => void
  ) => void;
  loadUri: (spotifyUri: string) => void;
  pause: () => void;
  play: () => void;
  restart: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number; theme?: "dark" },
    callback: (embedController: SpotifyEmbedController) => void
  ) => void;
}

declare global {
  interface Window {
    __spotifyIframeApi?: SpotifyIFrameAPI;
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
  }
}

const ResumeToolsPanel = ({ isOpen, onClose }: ResumeToolsPanelProps) => {
  const pomodoroCardRef = useRef<HTMLElement | null>(null);
  const compactSpotifyEmbedHostRef = useRef<HTMLDivElement | null>(null);
  const spotifyControllersRef = useRef<Partial<Record<SpotifyPlayerId, SpotifyEmbedController>>>({});
  const spotifyTrackHistoryRef = useRef<Record<SpotifyPlayerId, string[]>>({ compact: [], full: [] });
  const spotifyTrackCursorRef = useRef<Record<SpotifyPlayerId, number>>({ compact: -1, full: -1 });
  const [activeCarouselPage, setActiveCarouselPage] = useState(0);
  const [activeFullPlaylistId, setActiveFullPlaylistId] = useState<SpotifyFullPlaylistId>("trap-mojito");
  const [fullEmbedRefreshNonce, setFullEmbedRefreshNonce] = useState(0);
  const [spotifyPlaybackByPlayer, setSpotifyPlaybackByPlayer] = useState<Record<SpotifyPlayerId, SpotifyPlaybackState>>({
    compact: {
      isPaused: true,
      isStopped: true,
      duration: 0,
      position: 0,
    },
    full: {
      isPaused: true,
      isStopped: true,
      duration: 0,
      position: 0,
    },
  });
  const [todoCardHeight, setTodoCardHeight] = useState<number | null>(null);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [manualFocusMinutes, setManualFocusMinutes] = useState("25");
  const [manualBreakMinutes, setManualBreakMinutes] = useState("5");
  const [cycleTarget, setCycleTarget] = useState(4);
  const [manualCycles, setManualCycles] = useState("4");
  const [completedCycles, setCompletedCycles] = useState(0);
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [isNotificationMuted, setIsNotificationMuted] = useState(false);
  const [showOverlayMessage, setShowOverlayMessage] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const focusStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionEndedAudioRef = useRef<HTMLAudioElement | null>(null);
  const overlayHideTimeoutRef = useRef<number | null>(null);
  const previousPhaseRef = useRef<"focus" | "break">("focus");
  const previousRunningRef = useRef(false);

  const [todoDraft, setTodoDraft] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const previousAllTodosDoneRef = useRef(false);
  const todoConfettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const todoConfettiInstanceRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const selectedFullPlaylist = useMemo(
    () => spotifyFullPlaylists.find((playlist) => playlist.id === activeFullPlaylistId) ?? spotifyFullPlaylists[0],
    [activeFullPlaylistId]
  );

  useEffect(() => {
    if (!todoConfettiCanvasRef.current) {
      return;
    }

    todoConfettiInstanceRef.current = confetti.create(todoConfettiCanvasRef.current, {
      resize: true,
      useWorker: true,
    });

    return () => {
      todoConfettiInstanceRef.current?.reset();
      todoConfettiInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const areAllDone = todos.length > 0 && todos.every((todo) => todo.done);

    if (areAllDone && !previousAllTodosDoneRef.current) {
      const launchConfetti = todoConfettiInstanceRef.current;
      if (!launchConfetti) {
        previousAllTodosDoneRef.current = areAllDone;
        return;
      }

      launchConfetti({
        angle: 90,
        spread: 360,
        particleCount: Math.round(randomInRange(20, 32)),
        scalar: 0.7,
        startVelocity: 18,
        ticks: 90,
        gravity: 0.9,
        origin: { x: 0.5, y: 0.5 },
      });
    }

    previousAllTodosDoneRef.current = areAllDone;
  }, [todos]);

  useEffect(() => {
    const raw = readCookie(TODO_COOKIE_KEY);
    if (!raw) {
      previousAllTodosDoneRef.current = false;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TodoItem[];
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .filter((item) => typeof item.id === "string" && typeof item.text === "string")
          .map((item) => ({
            ...item,
            done: Boolean(item.done),
          }));

        // Seed completion baseline from persisted state so opening the page does not trigger confetti.
        previousAllTodosDoneRef.current = normalized.length > 0 && normalized.every((item) => item.done);
        setTodos(normalized);
      }
    } catch {
      previousAllTodosDoneRef.current = false;
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    spotifyTrackHistoryRef.current.full = [selectedFullPlaylist.uri];
    spotifyTrackCursorRef.current.full = 0;
  }, [selectedFullPlaylist]);

  useEffect(() => {
    saveSessionCookie(TODO_COOKIE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const focusAudio = new Audio("/focus-start.mp3");
    const breakAudio = new Audio("/break.mp3");
    const sessionEndedAudio = new Audio("/session-ended.mp3");
    focusAudio.preload = "auto";
    breakAudio.preload = "auto";
    sessionEndedAudio.preload = "auto";
    focusAudio.volume = 0.5;
    breakAudio.volume = 0.5;
    sessionEndedAudio.volume = 0.5;
    focusAudio.muted = isNotificationMuted;
    breakAudio.muted = isNotificationMuted;
    sessionEndedAudio.muted = isNotificationMuted;
    focusStartAudioRef.current = focusAudio;
    breakStartAudioRef.current = breakAudio;
    sessionEndedAudioRef.current = sessionEndedAudio;

    return () => {
      focusAudio.pause();
      breakAudio.pause();
      sessionEndedAudio.pause();
      focusStartAudioRef.current = null;
      breakStartAudioRef.current = null;
      sessionEndedAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (focusStartAudioRef.current) {
      focusStartAudioRef.current.muted = isNotificationMuted;
    }

    if (breakStartAudioRef.current) {
      breakStartAudioRef.current.muted = isNotificationMuted;
    }

    if (sessionEndedAudioRef.current) {
      sessionEndedAudioRef.current.muted = isNotificationMuted;
    }
  }, [isNotificationMuted]);

  const playNotification = (audio: HTMLAudioElement | null) => {
    if (!audio || isNotificationMuted) {
      return;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Browser autoplay restrictions can block sound until user interaction.
    });
  };

  const showTimerOverlayMessage = useCallback((message: string) => {
    if (!message) {
      return;
    }

    if (overlayHideTimeoutRef.current) {
      window.clearTimeout(overlayHideTimeoutRef.current);
      overlayHideTimeoutRef.current = null;
    }

    setOverlayMessage(message);
    setShowOverlayMessage(true);
    overlayHideTimeoutRef.current = window.setTimeout(() => {
      setShowOverlayMessage(false);
      overlayHideTimeoutRef.current = null;
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (overlayHideTimeoutRef.current) {
        window.clearTimeout(overlayHideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const syncTodoCardHeight = () => {
      if (!pomodoroCardRef.current) {
        return;
      }

      if (window.innerWidth < 1024) {
        setTodoCardHeight(null);
        return;
      }

      setTodoCardHeight(Math.ceil(pomodoroCardRef.current.getBoundingClientRect().height));
    };

    syncTodoCardHeight();

    const observer = new ResizeObserver(syncTodoCardHeight);
    if (pomodoroCardRef.current) {
      observer.observe(pomodoroCardRef.current);
    }

    window.addEventListener("resize", syncTodoCardHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncTodoCardHeight);
    };
  }, []);

  useEffect(() => {
    let isUnmounted = false;
    let apiPollTimer: number | null = null;
    const scriptSelector = 'script[src="https://open.spotify.com/embed/iframe-api/v1"]';

    const recordTrackHistory = (playerId: SpotifyPlayerId, playingURI: string) => {
      const history = spotifyTrackHistoryRef.current[playerId];
      const cursor = spotifyTrackCursorRef.current[playerId];
      const previousUri = cursor > 0 ? history[cursor - 1] : undefined;
      const nextUri = cursor >= 0 && cursor < history.length - 1 ? history[cursor + 1] : undefined;
      const currentUri = cursor >= 0 ? history[cursor] : undefined;

      if (playingURI === currentUri) {
        return;
      }

      if (playingURI === previousUri) {
        spotifyTrackCursorRef.current[playerId] = cursor - 1;
        return;
      }

      if (playingURI === nextUri) {
        spotifyTrackCursorRef.current[playerId] = cursor + 1;
        return;
      }

      const truncated = cursor >= 0 ? history.slice(0, cursor + 1) : [];
      truncated.push(playingURI);
      spotifyTrackHistoryRef.current[playerId] = truncated;
      spotifyTrackCursorRef.current[playerId] = truncated.length - 1;
    };

    const extractSpotifyUri = (data: Record<string, unknown> | undefined): string | null => {
      if (!data) {
        return null;
      }

      const trackCandidate =
        typeof data.track === "object" && data.track !== null
          ? (data.track as Record<string, unknown>).uri
          : undefined;

      const candidates = [
        data.playingURI,
        data.playingUri,
        data.uri,
        data.trackURI,
        data.trackUri,
        trackCandidate,
      ];

      const found = candidates.find((value) => typeof value === "string" && value.startsWith("spotify:"));
      return typeof found === "string" ? found : null;
    };

    const readNumericState = (data: Record<string, unknown>, keys: string[]) => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === "number" && Number.isFinite(value)) {
          return value;
        }
      }

      return null;
    };

    const readPausedState = (data: Record<string, unknown>) => {
      const raw = data.isPaused ?? data.paused;
      return typeof raw === "boolean" ? raw : null;
    };

    const pauseOtherPlayers = (activeId: SpotifyPlayerId) => {
      (Object.entries(spotifyControllersRef.current) as Array<[SpotifyPlayerId, SpotifyEmbedController | undefined]>).forEach(
        ([playerId, controller]) => {
          if (!controller || playerId === activeId) {
            return;
          }

          controller.pause(); 
        }
      );

      setSpotifyPlaybackByPlayer((current) => {
        const nextState = { ...current };

        (Object.keys(nextState) as SpotifyPlayerId[]).forEach((playerId) => {
          if (playerId !== activeId) {
            nextState[playerId] = { ...nextState[playerId], isPaused: true };
          }
        });

        return nextState;
      });
    };

    const createSpotifyController = (
      api: SpotifyIFrameAPI,
      playerId: SpotifyPlayerId,
      hostElement: HTMLDivElement,
      options: { uri: string; height: string | number; theme?: "dark" }
    ) => {
      if (spotifyControllersRef.current[playerId]) {
        return;
      }

      api.createController(
        hostElement,
        {
          ...options,
          width: "100%",
        },
        (controller) => {
          if (isUnmounted) {
            controller.destroy();
            return;
          }

          spotifyControllersRef.current[playerId] = controller;

          controller.addListener("playback_started", (event) => {
            const eventData = event && "data" in event ? (event.data as Record<string, unknown>) : undefined;
            const playingURI = extractSpotifyUri(eventData);

            if (playingURI) {
              recordTrackHistory(playerId, playingURI);
            }

            pauseOtherPlayers(playerId);
            setSpotifyPlaybackByPlayer((current) => ({
              ...current,
              [playerId]: {
                ...current[playerId],
                isPaused: false,
                isStopped: false,
              },
            }));
          });

          controller.addListener("playback_update", (event) => {
            const data = event?.data as Record<string, unknown> | undefined;

            if (!data) {
              return;
            }

            const playingURI = extractSpotifyUri(data);
            if (playingURI) {
              recordTrackHistory(playerId, playingURI);
            }

            const isPaused = readPausedState(data);
            const duration = readNumericState(data, ["duration", "durationMs", "duration_ms"]);
            const position = readNumericState(data, ["position", "positionMs", "position_ms"]);

            const nextPaused = isPaused ?? spotifyPlaybackByPlayer[playerId].isPaused;
            const nextDuration = duration ?? spotifyPlaybackByPlayer[playerId].duration;
            const nextPosition = position ?? spotifyPlaybackByPlayer[playerId].position;

            if (!nextPaused) {
              pauseOtherPlayers(playerId);
            }

            setSpotifyPlaybackByPlayer((current) => ({
              ...current,
              [playerId]: {
                ...current[playerId],
                duration: nextDuration,
                isPaused: nextPaused,
                isStopped: current[playerId].isStopped,
                position: nextPosition,
              },
            }));
          });
        }
      );
    };

    const initializeSpotify = (api: SpotifyIFrameAPI) => {
      if (isUnmounted) {
        return;
      }

      const theme = document.documentElement.classList.contains("dark") ? "dark" : undefined;

      if (compactSpotifyEmbedHostRef.current) {
        createSpotifyController(api, "compact", compactSpotifyEmbedHostRef.current, {
          uri: "spotify:album:7xhBr6txSs5ufgYlSXgwJL",
          height: 152,
          theme,
        });
      }
    };

    const readyHandler = (api: SpotifyIFrameAPI) => {
      window.__spotifyIframeApi = api;
      initializeSpotify(api);
    };

    window.onSpotifyIframeApiReady = readyHandler;

    if (window.__spotifyIframeApi) {
      initializeSpotify(window.__spotifyIframeApi);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(scriptSelector);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    }

    // Fallback: if the callback was missed, poll briefly for the cached API object.
    apiPollTimer = window.setInterval(() => {
      if (window.__spotifyIframeApi) {
        initializeSpotify(window.__spotifyIframeApi);
        if (apiPollTimer) {
          window.clearInterval(apiPollTimer);
          apiPollTimer = null;
        }
      }
    }, 300);

    window.setTimeout(() => {
      if (apiPollTimer) {
        window.clearInterval(apiPollTimer);
        apiPollTimer = null;
      }
    }, 5000);

    return () => {
      isUnmounted = true;
      if (window.onSpotifyIframeApiReady === readyHandler) {
        window.onSpotifyIframeApiReady = undefined;
      }
      if (apiPollTimer) {
        window.clearInterval(apiPollTimer);
        apiPollTimer = null;
      }
      (Object.values(spotifyControllersRef.current) as Array<SpotifyEmbedController | undefined>).forEach((controller) => {
        controller?.destroy();
      });
      spotifyControllersRef.current = {};
      setSpotifyPlaybackByPlayer({
        compact: {
          isPaused: true,
          isStopped: true,
          duration: 0,
          position: 0,
        },
        full: {
          isPaused: true,
          isStopped: true,
          duration: 0,
          position: 0,
        },
      });
    };
  }, []);

  const toggleSpotifyPlayPause = () => {
    const activeController = spotifyControllersRef.current.compact;
    if (!activeController) {
      return;
    }

    const activePlayback = spotifyPlaybackByPlayer.compact;

    if (activePlayback.isPaused) {
      activeController.resume();
      setSpotifyPlaybackByPlayer((current) => ({
        ...current,
        compact: {
          ...current.compact,
          isPaused: false,
          isStopped: false,
        },
      }));
      return;
    }

    activeController.pause();
    setSpotifyPlaybackByPlayer((current) => ({
      ...current,
      compact: {
        ...current.compact,
        isPaused: true,
      },
    }));
  };

  const stopSpotify = () => {
    const activeController = spotifyControllersRef.current.compact;
    if (!activeController) {
      return;
    }

    activeController.pause();
    activeController.restart();
    setSpotifyPlaybackByPlayer((current) => ({
      ...current,
      compact: {
        ...current.compact,
        isPaused: true,
        isStopped: true,
        position: 0,
      },
    }));
  };



  const nextSpotify = () => {
    const activeController = spotifyControllersRef.current.compact;
    const activePlayback = spotifyPlaybackByPlayer.compact;

    if (!activeController) {
      return;
    }

    const history = spotifyTrackHistoryRef.current.compact;
    const cursor = spotifyTrackCursorRef.current.compact;

    if (cursor >= 0 && cursor < history.length - 1) {
      const nextUri = history[cursor + 1];
      if (nextUri) {
        spotifyTrackCursorRef.current.compact = cursor + 1;
        activeController.loadUri(nextUri);
        activeController.play();
      }
    } else if (activePlayback.duration > 0) {
      activeController.seek(Math.max(0, Math.floor(activePlayback.duration / 1000) - 1));
    } else {
      return;
    }

    setSpotifyPlaybackByPlayer((current) => ({
      ...current,
      compact: {
        ...current.compact,
        isPaused: false,
        isStopped: false,
      },
    }));
  };

  const activeSpotifyPlayback = spotifyPlaybackByPlayer.compact;
  const showSpotifyControls = Boolean(!activeSpotifyPlayback.isStopped);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          if (phase === "focus") {
            const nextCompletedCycles = completedCycles + 1;
            setCompletedCycles(nextCompletedCycles);

            if (nextCompletedCycles >= cycleTarget) {
              window.clearInterval(timer);
              setIsRunning(false);
              setPhase("focus");
              playNotification(sessionEndedAudioRef.current);
              showTimerOverlayMessage(pickRandomMessage(cycleEndMessages));
              return 0;
            }

            setPhase("break");
            return breakMinutes * 60;
          }

          setPhase("focus");
          return focusMinutes * 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    breakMinutes,
    completedCycles,
    cycleTarget,
    focusMinutes,
    isRunning,
    phase,
    isNotificationMuted,
    showTimerOverlayMessage,
  ]);

  useEffect(() => {
    const isSessionStart =
      isRunning && phase === "focus" && completedCycles === 0 && remainingSeconds === focusMinutes * 60;

    if (!isSessionStart) {
      return;
    }

    showTimerOverlayMessage("Session started. Good luck!");
  }, [completedCycles, focusMinutes, isRunning, phase, remainingSeconds, showTimerOverlayMessage]);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    const wasRunning = previousRunningRef.current;

    if (!wasRunning && isRunning && phase === "focus") {
      playNotification(focusStartAudioRef.current);
    }

    if (wasRunning && previousPhase === "focus" && phase === "break") {
      playNotification(breakStartAudioRef.current);
      showTimerOverlayMessage(pickRandomMessage(breakStartMessages));
    }

    if (wasRunning && previousPhase === "break" && phase === "focus" && isRunning) {
      playNotification(focusStartAudioRef.current);
      showTimerOverlayMessage(pickRandomMessage(focusResumeMessages));
    }

    previousPhaseRef.current = phase;
    previousRunningRef.current = isRunning;
  }, [isRunning, phase, showTimerOverlayMessage]);

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const displayedCycle = useMemo(() => {
    if (phase === "break") {
      return Math.max(1, Math.min(completedCycles, cycleTarget));
    }

    return Math.max(1, Math.min(completedCycles + 1, cycleTarget));
  }, [completedCycles, cycleTarget, phase]);

  const selectedPresetId = useMemo(() => {
    const matchingPreset = timerPresets.find(
      (preset) => preset.focusMinutes === focusMinutes && preset.breakMinutes === breakMinutes
    );
    return matchingPreset?.id ?? timerPresets[0].id;
  }, [focusMinutes, breakMinutes]);

  const selectPreset = (focus: number, rest: number) => {
    setFocusMinutes(focus);
    setManualFocusMinutes(String(focus));
    setBreakMinutes(rest);
    setManualBreakMinutes(String(rest));
    setCycleTarget(4);
    setManualCycles("4");
    setCompletedCycles(0);
    setPhase("focus");
    setRemainingSeconds(focus * 60);
    setIsRunning(false);
  };

  const applyManualTimer = () => {
    const parsedFocus = Number(manualFocusMinutes);
    const parsedBreak = Number(manualBreakMinutes);
    const parsedCycles = Number(manualCycles);

    if (!Number.isFinite(parsedFocus) || !Number.isFinite(parsedBreak) || !Number.isFinite(parsedCycles)) {
      return;
    }

    const normalizedFocus = Math.min(240, Math.max(1, Math.round(parsedFocus)));
    const normalizedBreak = Math.min(60, Math.max(1, Math.round(parsedBreak)));
    const normalizedCycles = Math.min(20, Math.max(1, Math.round(parsedCycles)));

    setFocusMinutes(normalizedFocus);
    setBreakMinutes(normalizedBreak);
    setCycleTarget(normalizedCycles);
    setManualFocusMinutes(String(normalizedFocus));
    setManualBreakMinutes(String(normalizedBreak));
    setManualCycles(String(normalizedCycles));
    setCompletedCycles(0);
    setPhase("focus");
    setRemainingSeconds(normalizedFocus * 60);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setRemainingSeconds(focusMinutes * 60);
    setCompletedCycles(0);
    setPhase("focus");
    setIsRunning(false);
  };

  const handleAddTodo = (event: FormEvent) => {
    event.preventDefault();
    const text = todoDraft.trim();
    if (!text) {
      return;
    }

    setTodos((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        done: false,
      },
      ...current,
    ]);
    setTodoDraft("");
  };

  const activeToolsTitle = activeCarouselPage === 0 ? "Pomodoro + Tasks" : "Spotify";

  return (
    <section className="relative z-10 h-full overflow-y-auto bg-transparent text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-12 items-center justify-between gap-3 px-4 md:h-14">
          <h1 className="text-base font-semibold text-foreground md:text-xl">Tools</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{activeToolsTitle}</h2>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCarouselPage((current) => Math.max(0, current - 1))}
              disabled={activeCarouselPage === 0}
              aria-label="Previous tools page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCarouselPage((current) => Math.min(1, current + 1))}
              disabled={activeCarouselPage === 1}
              aria-label="Next tools page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeCarouselPage * 100}%)` }}
          >
            <div className="w-full shrink-0">
              <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
                <article ref={pomodoroCardRef} className="hover-chroma-border rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground">Pomodoro Timer</h3>

                  <div className="mt-4">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Preset
                      <div className="relative mt-1">
                        <select
                          value={selectedPresetId}
                          onChange={(event) => {
                            const preset = timerPresets.find((item) => item.id === event.target.value);
                            if (preset) {
                              selectPreset(preset.focusMinutes, preset.breakMinutes);
                            }
                          }}
                          className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-10 text-sm font-normal tracking-normal text-foreground"
                        >
                          {timerPresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </label>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {timerPresets.find((preset) => preset.id === selectedPresetId)?.description ?? "Using custom timer values."}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-[auto_auto_auto_auto] sm:items-end">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Focus (1-240 min)
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={manualFocusMinutes}
                  onChange={(event) => setManualFocusMinutes(event.target.value)}
                  className="mt-1 h-10 w-32 rounded-xl border border-border bg-background px-3 text-sm font-normal tracking-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Break (1-60 min)
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={manualBreakMinutes}
                  onChange={(event) => setManualBreakMinutes(event.target.value)}
                  className="mt-1 h-10 w-32 rounded-xl border border-border bg-background px-3 text-sm font-normal tracking-normal text-foreground"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Cycles (1-20)
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={manualCycles}
                  onChange={(event) => setManualCycles(event.target.value)}
                  className="mt-1 h-10 w-28 rounded-xl border border-border bg-background px-3 text-sm font-normal tracking-normal text-foreground"
                />
              </label>
              <button
                type="button"
                onClick={applyManualTimer}
                className="h-10 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
              >
                Apply
              </button>
                  </div>

                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-background px-4 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {phase === "focus" ? "Focus" : "Break"} • Cycle {displayedCycle}/{cycleTarget}
              </p>
              <p className="text-4xl font-bold tracking-wide text-foreground md:text-5xl">{timeLabel}</p>
              <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-background/90 px-4 transition-opacity duration-300 ${
                  showOverlayMessage ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showOverlayMessage}
              >
                <p className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {overlayMessage}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunning((current) => !current)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotificationMuted((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
                  aria-label={isNotificationMuted ? "Unmute notification sounds" : "Mute notification sounds"}
                >
                  {isNotificationMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isNotificationMuted ? "Unmute" : "Mute"}
                </button>
              </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background p-2">
                    <div
                      data-testid="compact-embed-iframe"
                      ref={compactSpotifyEmbedHostRef}
                      className="h-[152px] w-full overflow-hidden rounded-xl"
                    />
                  </div>
                </article>

                <article
                  className="hover-chroma-border relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5"
                  style={todoCardHeight ? { height: `${todoCardHeight}px` } : undefined}
                >
                  <h3 className="text-lg font-semibold text-foreground">To-do List</h3>

                  <form onSubmit={handleAddTodo} className="mt-4 flex gap-2">
              <input
                type="text"
                value={todoDraft}
                onChange={(event) => setTodoDraft(event.target.value)}
                className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                placeholder="Add a task"
              />
              <button
                type="submit"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
              >
                Add
              </button>
                  </form>

                    <div className="relative mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-background">
                  <canvas ref={todoConfettiCanvasRef} className="pointer-events-none absolute inset-0 z-20" aria-hidden />
              {todos.length === 0 ? (
                <div className="flex h-full min-h-[12rem] flex-col items-center justify-center px-4 text-center text-muted-foreground">
                  <span className="text-5xl font-light leading-none">+</span>
                  <p className="mt-2 text-sm">No tasks yet, add a new task</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {todos.map((todo) => (
                    <li key={todo.id} className="flex items-center gap-2 px-3 py-2">
                      <Checkbox
                        checked={todo.done}
                        onCheckedChange={() => {
                          setTodos((current) => current.map((item) => (item.id === todo.id ? { ...item, done: !item.done } : item)));
                        }}
                        aria-label={`Mark ${todo.text} as done`}
                      />
                      <span className={`text-sm ${todo.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {todo.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTodos((current) => current.filter((item) => item.id !== todo.id))}
                        aria-label={`Delete ${todo.text}`}
                        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground hover:bg-card"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
                  </div>
                </article>
              </div>
            </div>

            <div className="w-full shrink-0">
              <article
                className="hover-chroma-border flex flex-col rounded-2xl border border-border bg-card p-5"
                style={todoCardHeight ? { height: `${todoCardHeight}px` } : undefined}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {spotifyFullPlaylists.map((playlist) => {
                    const isActive = playlist.id === activeFullPlaylistId;
                    return (
                      <button
                        key={playlist.id}
                        type="button"
                        onClick={() => {
                          setActiveFullPlaylistId(playlist.id);
                          setFullEmbedRefreshNonce((current) => current + 1);
                        }}
                        aria-pressed={isActive}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                          isActive
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-foreground hover:bg-card"
                        }`}
                      >
                        {playlist.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 min-h-[352px] flex-1 overflow-hidden rounded-2xl border border-dashed border-border bg-background p-2">
                  <iframe
                    key={`${activeFullPlaylistId}-${fullEmbedRefreshNonce}`}
                    data-testid="full-embed-iframe"
                    style={{ borderRadius: 12 }}
                    src={`${selectedFullPlaylist.embedSrc}${selectedFullPlaylist.embedSrc.includes("?") ? "&" : "?"}pill_refresh=${fullEmbedRefreshNonce}`}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="h-full w-full overflow-hidden rounded-xl"
                  />
                </div>
              </article>
            </div>
          </div>
        </div>

        {!isOpen && <div className="h-10" />}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          showSpotifyControls ? (
            <div className="fixed bottom-12 left-1/2 z-[75] flex -translate-x-1/2 items-center justify-center gap-1.5 md:bottom-14 md:gap-2">
              <button
                type="button"
                onClick={toggleSpotifyPlayPause}
                aria-label={activeSpotifyPlayback?.isPaused ? "Play" : "Pause"}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border bg-card/95 px-2 text-foreground shadow-md backdrop-blur-sm hover:bg-card md:h-9 md:min-w-9"
              >
                {activeSpotifyPlayback?.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={stopSpotify}
                aria-label="Stop"
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border bg-card/95 px-2 text-foreground shadow-md backdrop-blur-sm hover:bg-card md:h-9 md:min-w-9"
              >
                <Square className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={nextSpotify}
                aria-label="Next"
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-border bg-card/95 px-2 text-foreground shadow-md backdrop-blur-sm hover:bg-card md:h-9 md:min-w-9"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          ) : null,
          document.body
        )}
    </section>
  );
};

export default ResumeToolsPanel;
