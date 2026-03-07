"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { ACCENT_DOT_COLOR, ACCENT_PALETTE, type AccentColor, useTheme } from "@/lib/theme-context";

// ── Accent colour labels for aria ─────────────────────────────────────────
const ACCENT_LABEL: Record<AccentColor, string> = {
  gold:   "Gold",
  blue:   "Blue",
  green:  "Green",
  red:    "Red",
  violet: "Violet",
};

const ACCENT_ORDER: AccentColor[] = ["gold", "blue", "green", "red", "violet"];

// ── AccentPicker ──────────────────────────────────────────────────────────
export function AccentPicker({ className = "" }: { className?: string }) {
  const { accent, setAccent, theme } = useTheme();

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      role="group"
      aria-label="Choose accent colour"
    >
      {ACCENT_ORDER.map((color) => {
        const isActive = accent === color;
        // Use the actual palette color for the dot so it's always vivid
        const dotColor = ACCENT_DOT_COLOR[color];
        // Ring uses the palette tone for current theme for harmony
        const ringColor = ACCENT_PALETTE[color][theme].accent;
        return (
          <motion.button
            key={color}
            type="button"
            onClick={() => setAccent(color)}
            aria-label={`Set accent to ${ACCENT_LABEL[color]}`}
            aria-pressed={isActive}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              background: dotColor,
              boxShadow: isActive
                ? `0 0 0 2px var(--bg-base), 0 0 0 4px ${ringColor}`
                : "none",
            }}
            className={`h-5 w-5 rounded-full transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`}
          />
        );
      })}
    </div>
  );
}

// ── ThemeToggle ───────────────────────────────────────────────────────────
interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center gap-2 rounded-xl border
        border-[var(--border-default)] bg-[var(--bg-elevated)]
        text-sm text-[var(--text-primary)] transition
        hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        ${compact ? "h-9 w-9 justify-center" : "px-3 py-2"}
        ${className}
      `}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-[var(--accent)]" />
        ) : (
          <Moon className="h-4 w-4 text-[var(--accent)]" />
        )}
      </motion.span>

      {!compact && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </motion.button>
  );
}

