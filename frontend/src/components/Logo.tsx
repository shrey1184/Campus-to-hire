"use client";

import Link from "next/link";

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
 * Uses a luminance-mask SVG so background-color: var(--accent) fills the logo
 * shape directly — zero filter math, pixel-perfect colour for every accent.
 */
function LogoImage({ size = "md", className = "" }: Pick<LogoProps, "size" | "className">) {
  const height = HEIGHTS[size];

  return (
    <div
      role="img"
      aria-label="Campus for Hire"
      className={className}
      style={{
        height: `${height}px`,
        width: `${height}px`,
        backgroundColor: "var(--accent)",
        WebkitMaskImage: "url(/logo-mask.svg)",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: "url(/logo-mask.svg)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        transition: "background-color 0.35s ease",
        display: "block",
        flexShrink: 0,
      }}
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
