"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  shimmerColor?: string;
}

export function ShimmerButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  shimmerColor = "rgba(255,255,255,0.25)",
}: ShimmerButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden",
        "px-6 py-3 rounded-lg",
        "font-medium text-sm tracking-wide p-0 m-0 leading-none",
        "bg-[var(--accent)] text-[var(--text-inverse)]",
        "border border-[var(--accent)]",
        "shadow-[0_0_20px_var(--accent-glow)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors duration-150",
        className
      )}
      whileHover={shouldReduceMotion ? {} : { scale: disabled ? 1 : 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: disabled ? 1 : 0.98 }}
    >
      {/* Shimmer effect */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              ${shimmerColor} 50%,
              transparent 100%
            )`,
          }}
          animate={{
            x: ["-200%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
