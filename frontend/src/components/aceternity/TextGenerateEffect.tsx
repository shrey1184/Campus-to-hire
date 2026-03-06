"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useAnimate,
  stagger,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  wordClassName?: string;
  once?: boolean;
}

/**
 * Word-by-word text reveal animation component
 * Reveals each word with a staggered fade-in effect
 */
export function TextGenerateEffect({
  words,
  className = "",
  delay = 0,
  staggerDelay = 0.1,
  wordClassName = "",
  once = true,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        if (shouldReduceMotion) {
          // For reduced motion, just show all words immediately
          animate("span", { opacity: 1, y: 0 }, { duration: 0 });
        } else {
          animate(
            "span",
            { opacity: 1, y: 0, filter: "blur(0px)" },
            {
              duration: 0.5,
              delay: stagger(staggerDelay),
              ease: "easeOut",
            }
          );
        }
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, animate, delay, staggerDelay, shouldReduceMotion]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div ref={scope} className="inline">
        <AnimatePresence>
          {wordsArray.map((word, idx) => (
            <motion.span
              key={`${word}-${idx}`}
              className={cn(
                "inline-block opacity-0 mr-[0.25em] will-change-transform",
                wordClassName
              )}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, filter: "blur(8px)" }
              }
              style={{ display: "inline-block" }}
            >
              {word}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TextGenerateByCharacterProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

/**
 * Character-by-character text reveal animation
 * For more granular animation control
 */
export function TextGenerateByCharacter({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.03,
  once = true,
}: TextGenerateByCharacterProps) {
  const [scope, animate] = useAnimate();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();
  const characters = text.split("");

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        if (shouldReduceMotion) {
          animate("span", { opacity: 1 }, { duration: 0.1 });
        } else {
          animate(
            "span",
            { opacity: 1 },
            {
              duration: 0.3,
              delay: stagger(staggerDelay),
              ease: "easeOut",
            }
          );
        }
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, animate, delay, staggerDelay, shouldReduceMotion]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div ref={scope} className="inline">
        {characters.map((char, idx) => (
          <motion.span
            key={`${char}-${idx}`}
            className="inline-block opacity-0"
            initial={{ opacity: 0 }}
            style={{ display: char === " " ? "inline" : "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
