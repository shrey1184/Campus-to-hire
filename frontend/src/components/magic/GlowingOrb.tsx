"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
  secondaryColor?: string;
  blur?: number;
  pulseDuration?: number;
  floatDuration?: number;
  opacity?: number;
  variant?: "default" | "soft" | "intense";
  delay?: number;
}

export function GlowingOrb({
  className,
  size = 400,
  color = "var(--accent)",
  secondaryColor = "var(--accent-hover)",
  blur = 100,
  pulseDuration = 4,
  floatDuration = 8,
  opacity = 0.4,
  variant = "default",
  delay = 0,
}: GlowingOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  // Predefined variants for different intensity levels
  const variants = {
    default: {
      opacity: [opacity * 0.6, opacity, opacity * 0.6],
      scale: [0.95, 1.05, 0.95],
    },
    soft: {
      opacity: [opacity * 0.8, opacity * 0.95, opacity * 0.8],
      scale: [0.98, 1.02, 0.98],
    },
    intense: {
      opacity: [opacity * 0.4, opacity * 1.2, opacity * 0.4],
      scale: [0.9, 1.15, 0.9],
    },
  };

  const floatAnimation = shouldReduceMotion
    ? {}
    : {
        y: [0, -30, 0],
        x: [0, 15, 0],
      };

  const pulseAnimation = shouldReduceMotion
    ? {}
    : variants[variant];

  return (
    <motion.div
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color} 0%, ${secondaryColor} 40%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity: shouldReduceMotion ? opacity * 0.5 : undefined,
      }}
      animate={{
        ...pulseAnimation,
        ...floatAnimation,
      }}
      transition={{
        opacity: {
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        scale: {
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        x: {
          duration: floatDuration * 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }}
    />
  );
}

// Multiple orbs for hero background
interface OrbClusterProps {
  className?: string;
  orbCount?: number;
}

export function OrbCluster({ className, orbCount = 3 }: OrbClusterProps) {
  const shouldReduceMotion = useReducedMotion();

  const orbs = [
    { size: 500, color: "var(--accent)", opacity: 0.3, x: "-20%", y: "20%" },
    { size: 350, color: "var(--accent-hover)", opacity: 0.25, x: "60%", y: "-10%" },
    { size: 280, color: "var(--accent)", opacity: 0.2, x: "30%", y: "50%" },
  ];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {orbs.slice(0, orbCount).map((orb, index) => (
        <GlowingOrb
          key={index}
          size={orb.size}
          color={orb.color}
          opacity={shouldReduceMotion ? orb.opacity * 0.5 : orb.opacity}
          className={`absolute`}
          pulseDuration={4 + index}
          floatDuration={8 + index * 2}
          style={{
            left: orb.x,
            top: orb.y,
          }}
        />
      ))}
    </div>
  );
}

// Static glow background for reduced motion
export function StaticGlow({
  className,
  size = 400,
  color = "var(--accent)",
  opacity = 0.2,
}: Omit<GlowingOrbProps, "pulseDuration" | "floatDuration" | "variant">) {
  return (
    <div
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
        opacity,
      }}
    />
  );
}
