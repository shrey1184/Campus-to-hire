"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import type { AccentColor, Theme } from "@/lib/theme-context";

interface LogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Wrap in a Link to home */
  linked?: boolean;
  className?: string;
}

/** Height in px for each size (the SVG viewBox is 1:1 so width = height) */
const HEIGHTS: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 28,
  md: 40,
  lg: 60,
};

/**
 * Hue-rotate offset (degrees) from the sepia base (~35°) to each accent color.
 * sepia(0.7) + saturate(3) + hue-rotate(X) tints the logo without flattening
 * the internal grayscale detail, so letter shapes and icon depth are preserved.
 */
const ACCENT_HUE: Record<AccentColor, number> = {
  gold:   5,
  blue:   175,
  green:  100,
  red:    330,
  violet: 215,
};

function getFilter(theme: Theme, accent: AccentColor): string {
  const hue = ACCENT_HUE[accent];
  // Tint preserves relative luminance so counters / shadows stay distinct
  const tint = `sepia(0.7) saturate(3) hue-rotate(${hue}deg)`;
  return theme === "dark"
    ? `invert(1) ${tint} brightness(1.1)`
    : `${tint} brightness(0.9)`;
}

function LogoImage({ size = "md", className = "" }: Pick<LogoProps, "size" | "className">) {
  const { theme, accent } = useTheme();
  const height = HEIGHTS[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/campus-for-hire.svg"
      alt="Campus for Hire"
      style={{
        height: `${height}px`,
        width: "auto",
        filter: getFilter(theme, accent),
        transition: "filter 0.35s ease",
        display: "block",
      }}
      className={className}
    />
  );
}

export default function Logo({ size = "md", linked = false, className = "" }: LogoProps) {
  if (linked) {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`}>
        <LogoImage size={size} />
      </Link>
    );
  }
  return <LogoImage size={size} className={className} />;
}
