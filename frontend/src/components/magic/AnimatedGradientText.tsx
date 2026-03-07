"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AnimatedGradientText({
  children,
  className = "",
  colors,
  speed = 3,
}: AnimatedGradientTextProps) {
  const shouldReduceMotion = useReducedMotion();

  // Use accent variable as default — resolved at render time
  const resolvedColors = colors ?? ["var(--accent)", "var(--accent-hover)", "var(--accent)", "var(--accent-hover)"];

  // Create gradient string from colors
  const gradient = `linear-gradient(90deg, ${resolvedColors.join(", ")})`;

  if (shouldReduceMotion) {
    return (
      <span
        className={cn(
          "bg-clip-text text-transparent",
          className
        )}
        style={{
          backgroundImage: gradient,
          backgroundSize: "200% auto",
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={cn("inline-block bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: gradient,
        backgroundSize: "200% auto",
      }}
      animate={{
        backgroundPosition: ["0% center", "200% center"],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
}

// Alternative version with shimmer/aurora-like animated background
interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className = "" }: ShimmerTextProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span
      className={cn(
        "relative inline-block",
        "bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--accent)]",
        "bg-clip-text text-transparent",
        className
      )}
      style={{
        backgroundSize: "200% auto",
        animation: shouldReduceMotion ? undefined : "shimmer 3s linear infinite",
      }}
    >
      {children}
    </span>
  );
}
