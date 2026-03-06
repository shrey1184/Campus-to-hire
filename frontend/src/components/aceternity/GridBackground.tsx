"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface GridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  dotColor?: string;
  gridSize?: number;
  animated?: boolean;
}

/**
 * Animated grid/dot background component
 * Features animated opacity pulses for a dynamic effect
 */
export function GridBackground({
  className = "",
  children,
  dotColor = "var(--accent)",
  gridSize = 60,
  animated = true,
}: GridBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const isAnimated = animated && !shouldReduceMotion;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Grid pattern with animated opacity pulses */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${dotColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${dotColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
        initial={{ opacity: 0.03 }}
        animate={
          isAnimated
            ? {
                opacity: [0.03, 0.06, 0.03],
              }
            : { opacity: 0.03 }
        }
        transition={
          isAnimated
            ? {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
      />

      {/* Secondary grid offset for depth */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle, ${dotColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize / 2}px ${gridSize / 2}px`,
          backgroundPosition: `${gridSize / 4}px ${gridSize / 4}px`,
        }}
        initial={{ opacity: 0.02 }}
        animate={
          isAnimated
            ? {
                opacity: [0.02, 0.05, 0.02],
              }
            : { opacity: 0.02 }
        }
        transition={
          isAnimated
            ? {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }
            : undefined
        }
      />

      {/* Radial fade to blend with edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, var(--bg-base) 70%)",
        }}
      />

      {/* Content */}
      {children}
    </div>
  );
}
