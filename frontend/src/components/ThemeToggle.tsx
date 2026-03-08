"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image, Moon, Sun, X } from "lucide-react";
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

// ── BackgroundImagePicker ─────────────────────────────────────────────────
interface BackgroundImagePickerProps {
  className?: string;
  /** Which direction the popover opens. Default: "up" (for sidebars/footers). Use "down" for top navbars. */
  popoverDirection?: "up" | "down";
}

export function BackgroundImagePicker({
  className = "",
  popoverDirection = "up",
}: BackgroundImagePickerProps) {
  const { bgImage, bgOpacity, glassOpacity, setBgImage, setBgOpacity, setGlassOpacity } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // When a file is chosen, create an object URL and set it as background
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImage(url);
      setIsOpen(true);
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleButtonClick = () => {
    if (bgImage) {
      // Toggle the popover (slider panel) if image already set
      setIsOpen((prev) => !prev);
    } else {
      // No image yet — open file picker directly
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setBgImage(null);
    setIsOpen(false);
  };

  const popoverPositionClass =
    popoverDirection === "down"
      ? "top-full mt-2 origin-top"
      : "bottom-full mb-2 origin-bottom";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Trigger button — same style as ThemeToggle compact */}
      <motion.button
        type="button"
        onClick={handleButtonClick}
        whileTap={{ scale: 0.92 }}
        aria-label="Set background image"
        title="Background image"
        className={`
          relative flex h-9 w-9 items-center justify-center rounded-xl border
          border-[var(--border-default)] bg-[var(--bg-elevated)]
          text-sm transition
          hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        `}
      >
        <Image className="h-4 w-4 text-[var(--accent)]" />
        {/* Dot indicator when a background image is active */}
        {bgImage && (
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-elevated)]" />
        )}
      </motion.button>

      {/* Popover panel — shown when isOpen and bgImage exists */}
      <AnimatePresence>
        {isOpen && bgImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: popoverDirection === "down" ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: popoverDirection === "down" ? -8 : 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute right-0 z-50 w-64 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 shadow-2xl backdrop-blur-xl ${popoverPositionClass}`}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Background
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Image preview thumbnail */}
            <div className="mb-4 h-28 w-full overflow-hidden rounded-xl bg-[var(--bg-overlay)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bgImage}
                alt="Background preview"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Image opacity slider */}
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Image opacity</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {Math.round(bgOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={bgOpacity}
                onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                style={{ accentColor: "var(--accent)" }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-overlay)]"
                aria-label="Background opacity"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Glass slider — controls surface transparency (lower surface-alpha = more glass) */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Glass</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {Math.round((1 - glassOpacity) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={1 - glassOpacity}
                onChange={(e) => setGlassOpacity(1 - parseFloat(e.target.value))}
                style={{ accentColor: "var(--accent)" }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-overlay)]"
                aria-label="Glass transparency"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Solid</span>
                <span>Glass</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex-1 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-400/10"
              >
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
