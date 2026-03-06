"use client";

import { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  fadeEdges?: boolean;
}

export function Marquee({
  children,
  className = "",
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  fadeEdges = true,
}: MarqueeProps) {
  const shouldReduceMotion = useReducedMotion();

  const speedMap = {
    slow: "40s",
    normal: "25s",
    fast: "15s",
  };

  // If reduced motion is preferred, show static content without animation
  if (shouldReduceMotion) {
    return (
      <div
        className={cn(
          "flex overflow-x-auto scrollbar-hide gap-4",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex overflow-hidden",
        fadeEdges && "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 gap-4",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `marquee ${speedMap[speed]} linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 gap-4",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `marquee ${speedMap[speed]} linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Vertical marquee variant
interface VerticalMarqueeProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
}

export function VerticalMarquee({
  children,
  className = "",
  direction = "up",
  speed = "normal",
  pauseOnHover = true,
}: VerticalMarqueeProps) {
  const shouldReduceMotion = useReducedMotion();

  const speedMap = {
    slow: "30s",
    normal: "20s",
    fast: "12s",
  };

  if (shouldReduceMotion) {
    return (
      <div className={cn("overflow-y-auto", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("group flex-col overflow-hidden", className)}>
      <div
        className={cn(
          "shrink-0",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `marquee-vertical ${speedMap[speed]} linear infinite`,
          animationDirection: direction === "down" ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
      <div
        className={cn(
          "shrink-0",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `marquee-vertical ${speedMap[speed]} linear infinite`,
          animationDirection: direction === "down" ? "reverse" : "normal",
        }}
      >
        {children}
      </div>
    </div>
  );
}
