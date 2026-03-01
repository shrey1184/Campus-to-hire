"use client";

import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-secondary transition-colors hover:border-border-hover hover:bg-bg-elevated hover:text-text-primary ${className}`}
      style={{
        borderColor: "var(--border-default)",
        background: "var(--bg-surface)",
        color: "var(--text-secondary)",
      }}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
