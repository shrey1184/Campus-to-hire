"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  containerClassName?: string;
  borderClassName?: string;
  borderWidth?: number;
  as?: keyof React.JSX.IntrinsicElements | React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  colors?: string[];
}

/**
 * Moving border gradient effect component
 * Creates a rotating conic gradient border animation
 */
export const MovingBorder = ({
  children,
  className,
  duration = 3000,
  containerClassName,
  borderClassName,
  borderWidth = 1,
  as: Component = "div",
  colors = ["var(--accent-blob)", "var(--accent-subtle)", "transparent"],
}: MovingBorderProps) => {
  const shouldReduceMotion = useReducedMotion();

  const gradientStyle = {
    background: `conic-gradient(from 0deg, ${colors.join(", ")})`,
  };

  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-2xl",
        containerClassName
      )}
      style={{ padding: borderWidth }}
    >
      {/* Animated rotating gradient */}
      <motion.div
        className={cn(
          "absolute inset-0 z-0 rounded-2xl",
          borderClassName
        )}
        style={gradientStyle}
        animate={
          shouldReduceMotion
            ? {}
            : {
                rotate: [0, 360],
              }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: duration / 1000,
                repeat: Infinity,
                ease: "linear",
              }
        }
      />

      {/* Inner content container */}
      <div
        className={cn(
          "relative z-10 h-full w-full rounded-2xl bg-card",
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
};

interface MovingBorderButtonProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "outline";
}

/**
 * Button with moving border effect
 */
export const MovingBorderButton = ({
  children,
  className,
  duration = 2000,
  onClick,
  href,
  variant = "primary",
}: MovingBorderButtonProps) => {
  const shouldReduceMotion = useReducedMotion();

  const baseClasses =
    variant === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-transparent border border-accent text-accent";

  const content = (
    <motion.div
      className={cn(
        "relative group overflow-hidden rounded-full px-6 py-3 font-semibold transition-all",
        baseClasses,
        className
      )}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      onClick={onClick}
    >
      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: ["-100%", "100%"],
              }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: duration / 1000,
                repeat: Infinity,
                ease: "linear",
              }
        }
      />
      <span className="relative z-10">{children}</span>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return content;
};
