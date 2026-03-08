"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
  intensity?: "low" | "medium" | "high";
  speed?: "slow" | "normal" | "fast";
}

/**
 * Animated aurora gradient background component
 * Creates flowing, animated gradient effects with multiple layers
 */
export function AuroraBackground({
  children,
  className = "",
  showRadialGradient = true,
  intensity = "medium",
  speed = "normal",
}: AuroraBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  const intensityConfig = {
    low: { opacity: 0.1, blur: "60px" },
    medium: { opacity: 0.2, blur: "80px" },
    high: { opacity: 0.35, blur: "100px" },
  };

  const speedConfig = {
    slow: 30,
    normal: 15,
    fast: 8,
  };

  const config = intensityConfig[intensity];
  const duration = speedConfig[speed];

  // Static version for reduced motion
  if (shouldReduceMotion) {
    return (
      <div className={cn("relative min-h-screen", className)}>
        <div className="absolute inset-0 overflow-hidden">
          {/* Static gradient layers */}
          <div
            className="absolute -inset-[100px] opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 50%, var(--accent-blob), transparent 50%)`,
              filter: `blur(${config.blur})`,
            }}
          />
        </div>
        {showRadialGradient && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 0%, var(--bg-base) 70%)",
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-screen", className)}>
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary aurora layer - Top right */}
        <motion.div
          className="absolute -right-[20%] -top-[20%] h-[60%] w-[60%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--accent-blob) 0%, var(--accent-glow) 40%, transparent 70%)",
            filter: `blur(${config.blur})`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary aurora layer - Bottom left */}
        <motion.div
          className="absolute -bottom-[20%] -left-[20%] h-[60%] w-[60%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--accent-glow) 0%, var(--accent-subtle) 40%, transparent 70%)",
            filter: `blur(${config.blur})`,
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: duration * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Tertiary aurora layer - Center */}
        <motion.div
          className="absolute left-[30%] top-[40%] h-[40%] w-[40%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--accent-subtle) 0%, transparent 60%)",
            filter: `blur(${config.blur})`,
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: duration * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Accent layer - Subtle color variation */}
        <motion.div
          className="absolute left-[20%] top-[20%] h-[50%] w-[50%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--accent-glow) 0%, transparent 50%)",
            filter: `blur(${config.blur})`,
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 80, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: duration * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* Gradient overlay for smooth blending */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              repeating-linear-gradient(
                100deg,
                var(--bg-base) 0%,
                transparent 10%,
                transparent 20%,
                var(--bg-base) 30%
              )
            `,
          }}
        />
      </div>

      {/* Radial gradient fade */}
      {showRadialGradient && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 0%, var(--bg-base) 60%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface AuroraHeroProps {
  children: ReactNode;
  className?: string;
}

/**
 * Hero section variant with aurora background
 * Pre-configured for landing page hero sections
 */
export function AuroraHero({ children, className = "" }: AuroraHeroProps) {
  return (
    <AuroraBackground
      className={className}
      intensity="high"
      speed="slow"
      showRadialGradient
    >
      {children}
    </AuroraBackground>
  );
}
