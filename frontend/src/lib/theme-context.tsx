"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────
export type Theme = "dark" | "light";
export type AccentColor = "gold" | "blue" | "green" | "red" | "violet";

interface AccentTokens {
  accent: string;
  hover: string;
  subtle: string;
  glow: string;
  blob: string;
}

interface AccentConfig {
  dark: AccentTokens;
  light: AccentTokens;
}

// ── Accent palette ─────────────────────────────────────────────────────────
export const ACCENT_PALETTE: Record<AccentColor, AccentConfig> = {
  gold: {
    dark:  { accent: "#c9a84c", hover: "#d4b85c", subtle: "rgba(201,168,76,0.12)",  glow: "rgba(201,168,76,0.20)",  blob: "rgba(201,168,76,0.35)"  },
    light: { accent: "#9a7b2e", hover: "#836820", subtle: "rgba(154,123,46,0.10)",  glow: "rgba(154,123,46,0.14)",  blob: "rgba(154,123,46,0.28)"  },
  },
  blue: {
    dark:  { accent: "#3b82f6", hover: "#60a5fa", subtle: "rgba(59,130,246,0.12)",  glow: "rgba(59,130,246,0.20)",  blob: "rgba(59,130,246,0.35)"  },
    light: { accent: "#1d4ed8", hover: "#1e40af", subtle: "rgba(29,78,216,0.10)",   glow: "rgba(29,78,216,0.14)",   blob: "rgba(29,78,216,0.28)"   },
  },
  green: {
    dark:  { accent: "#22c55e", hover: "#4ade80", subtle: "rgba(34,197,94,0.12)",   glow: "rgba(34,197,94,0.20)",   blob: "rgba(34,197,94,0.35)"   },
    light: { accent: "#15803d", hover: "#166534", subtle: "rgba(21,128,61,0.10)",   glow: "rgba(21,128,61,0.14)",   blob: "rgba(21,128,61,0.28)"   },
  },
  red: {
    dark:  { accent: "#ef4444", hover: "#f87171", subtle: "rgba(239,68,68,0.12)",   glow: "rgba(239,68,68,0.20)",   blob: "rgba(239,68,68,0.35)"   },
    light: { accent: "#b91c1c", hover: "#991b1b", subtle: "rgba(185,28,28,0.10)",   glow: "rgba(185,28,28,0.14)",   blob: "rgba(185,28,28,0.28)"   },
  },
  violet: {
    dark:  { accent: "#8b5cf6", hover: "#a78bfa", subtle: "rgba(139,92,246,0.12)", glow: "rgba(139,92,246,0.20)",  blob: "rgba(139,92,246,0.35)"  },
    light: { accent: "#6d28d9", hover: "#5b21b6", subtle: "rgba(109,40,217,0.10)", glow: "rgba(109,40,217,0.14)",  blob: "rgba(109,40,217,0.28)"  },
  },
};

// Preview dot color — always the bright version regardless of theme
export const ACCENT_DOT_COLOR: Record<AccentColor, string> = {
  gold:   "#c9a84c",
  blue:   "#3b82f6",
  green:  "#22c55e",
  red:    "#ef4444",
  violet: "#8b5cf6",
};

// ── Context ────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme:           Theme;
  accent:          AccentColor;
  toggleTheme:     () => void;
  setTheme:        (t: Theme) => void;
  setAccent:       (a: AccentColor) => void;
  bgImage:         string | null;
  bgOpacity:       number;
  glassOpacity:    number;
  setBgImage:      (url: string | null) => void;
  setBgOpacity:    (opacity: number) => void;
  setGlassOpacity: (opacity: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY  = "ch-theme";
const ACCENT_KEY = "ch-accent";

// ── Helper: write accent tokens to :root ───────────────────────────────────
function applyAccentVars(accent: AccentColor, theme: Theme) {
  const tokens = ACCENT_PALETTE[accent][theme];
  const root   = document.documentElement;
  root.style.setProperty("--accent",        tokens.accent);
  root.style.setProperty("--accent-hover",  tokens.hover);
  root.style.setProperty("--accent-subtle", tokens.subtle);
  root.style.setProperty("--accent-glow",   tokens.glow);
  root.style.setProperty("--accent-blob",   tokens.blob);
}

// ── Provider ───────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,      setThemeState]  = useState<Theme>("dark");
  const [accent,     setAccentState] = useState<AccentColor>("gold");
  const [mounted,    setMounted]     = useState(false);
  const [bgImage,      setBgImageState]      = useState<string | null>(null);
  const [bgOpacity,    setBgOpacityState]    = useState<number>(0.5);
  // glassOpacity = surface alpha: 1 = fully opaque panels, 0 = fully transparent (max glass)
  const [glassOpacity, setGlassOpacityState] = useState<number>(0.85);

  // Track previous object URL so we can revoke it on change
  const prevBgImageRef = useRef<string | null>(null);

  // Restore preferences on mount
  useEffect(() => {
    const storedTheme  = localStorage.getItem(THEME_KEY)  as Theme | null;
    const storedAccent = localStorage.getItem(ACCENT_KEY) as AccentColor | null;

    const resolvedTheme: Theme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";

    const resolvedAccent: AccentColor =
      storedAccent && storedAccent in ACCENT_PALETTE ? storedAccent : "gold";

    setThemeState(resolvedTheme);
    setAccentState(resolvedAccent);
    setMounted(true);
  }, []);

  // Apply both together whenever either changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    applyAccentVars(accent, theme);
  }, [theme, accent, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  const setAccent = useCallback((a: AccentColor) => setAccentState(a), []);

  // Revoke old object URL to avoid memory leaks
  const setBgImage = useCallback((url: string | null) => {
    if (prevBgImageRef.current && prevBgImageRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(prevBgImageRef.current);
    }
    prevBgImageRef.current = url;
    setBgImageState(url);
  }, []);

  const setBgOpacity = useCallback((opacity: number) => {
    setBgOpacityState(Math.min(1, Math.max(0, opacity)));
  }, []);

  const setGlassOpacity = useCallback((opacity: number) => {
    setGlassOpacityState(Math.min(1, Math.max(0, opacity)));
  }, []);

  // Inject a real div into document.body as the wallpaper layer.
  // A real positioned div (z-index:0) is guaranteed to paint ABOVE body's
  // normal-flow background (which is in the block-level painting step),
  // avoiding the "body background propagates to canvas" issue that breaks
  // html::before-based approaches.
  useEffect(() => {
    const root = document.documentElement;

    let wallpaperEl = document.getElementById("ch-wallpaper-el") as HTMLDivElement | null;
    if (!wallpaperEl) {
      wallpaperEl = document.createElement("div");
      wallpaperEl.id = "ch-wallpaper-el";
      wallpaperEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(wallpaperEl);
    }

    if (bgImage) {
      Object.assign(wallpaperEl.style, {
        display:            "block",
        position:           "fixed",
        inset:              "0",
        zIndex:             "0",
        backgroundImage:    `url("${bgImage}")`,
        backgroundSize:     "cover",
        backgroundPosition: "center",
        backgroundRepeat:   "no-repeat",
        opacity:            String(bgOpacity),
        pointerEvents:      "none",
        transition:         "opacity 0.15s ease",
      });
      root.style.setProperty("--surface-alpha", String(glassOpacity));
      root.classList.add("ch-wallpaper");
    } else {
      wallpaperEl.style.display = "none";
      root.style.removeProperty("--surface-alpha");
      root.classList.remove("ch-wallpaper");
    }
  }, [bgImage, bgOpacity, glassOpacity]);

  // Clean up wallpaper div on unmount
  useEffect(() => {
    return () => {
      document.getElementById("ch-wallpaper-el")?.remove();
      document.documentElement.classList.remove("ch-wallpaper");
      document.documentElement.style.removeProperty("--surface-alpha");
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setTheme, setAccent, bgImage, bgOpacity, glassOpacity, setBgImage, setBgOpacity, setGlassOpacity }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
