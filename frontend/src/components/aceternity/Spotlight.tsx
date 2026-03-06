"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import React from "react";

interface SpotlightProps {
  className?: string;
  fill?: string;
  size?: number;
}

/**
 * Cursor-following spotlight effect component
 * Creates a radial gradient that follows the mouse cursor
 */
export const Spotlight = ({
  className,
  fill = "rgba(201, 168, 76, 0.15)",
  size = 600,
}: SpotlightProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    if (shouldReduceMotion) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Static gradient for reduced motion
  if (shouldReduceMotion) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden",
          className
        )}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-50"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${fill}, transparent 80%)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${size}px circle at ${mouseX}px ${mouseY}px,
              ${fill},
              transparent 80%
            )
          `,
        }}
      />
    </div>
  );
};
