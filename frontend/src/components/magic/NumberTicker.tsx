"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useSpring, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  className?: string;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  formatFn?: (value: number) => string;
}

export function NumberTicker({
  value,
  className,
  direction = "up",
  delay = 0,
  duration = 2000,
  formatFn = (v) => Math.floor(v).toLocaleString(),
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useSpring(0, { duration, bounce: 0 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      if (shouldReduceMotion) {
        // Skip animation for reduced motion preference
        setDisplayValue(value);
        return;
      }
      
      const timeout = setTimeout(() => {
        motionValue.set(direction === "up" ? value : -value);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, motionValue, value, direction, delay, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(Math.abs(latest));
    });
    return () => unsubscribe();
  }, [motionValue, shouldReduceMotion]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-wider text-[var(--accent)]",
        className
      )}
    >
      {formatFn(displayValue)}
    </span>
  );
}
