"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Bento grid layout container
 * Responsive grid with auto-layout for bento-style cards
 */
export const BentoGrid = ({ className, children }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoGridItemProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  href?: string;
  onClick?: () => void;
}

/**
 * Individual bento grid item with hover effects
 * Supports varying column spans and interactive states
 */
export const BentoGridItem = ({
  className,
  children,
  title,
  description,
  header,
  icon,
  colSpan = 1,
  rowSpan = 1,
  href,
  onClick,
}: BentoGridItemProps) => {
  const shouldReduceMotion = useReducedMotion();

  const colSpanClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
  };

  const rowSpanClasses = {
    1: "",
    2: "md:row-span-2",
  };

  const content = (
    <motion.div
      className={cn(
        "group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.01,
              y: -2,
            }
      }
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(600px circle at 50% 50%, rgba(201, 168, 76, 0.06), transparent 40%)",
          }}
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header area (image/icon) */}
        {header && (
          <div className="mb-4 overflow-hidden rounded-lg">{header}</div>
        )}

        {/* Icon */}
        {icon && (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            {icon}
          </div>
        )}

        {/* Main content */}
        {children}

        {/* Title and description */}
        {(title || description) && (
          <div className="mt-auto pt-4">
            {title && (
              <h3 className="mb-1 font-semibold text-foreground transition-colors group-hover:text-accent">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>

      {/* Corner accent on hover */}
      <motion.div
        className="absolute bottom-0 right-0 h-16 w-16 opacity-0 transition-opacity group-hover:opacity-100"
        initial={false}
        animate={shouldReduceMotion ? {} : { rotate: 0 }}
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, rgba(201, 168, 76, 0.1) 50%)",
        }}
      />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="contents">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="contents text-left">
        {content}
      </button>
    );
  }

  return content;
};

interface BentoCardProps {
  name: string;
  className: string;
  background?: React.ReactNode;
  icon?: React.ReactNode;
  description: string;
  href?: string;
  cta?: string;
}

/**
 * Pre-styled bento card for common use cases
 */
export const BentoCard = ({
  name,
  className,
  background,
  icon,
  description,
  href,
  cta = "Learn more",
}: BentoCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={name}
      className={cn(
        "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-card border border-border",
        "shadow-sm transition-all duration-300",
        "hover:shadow-md hover:border-accent/30",
        className
      )}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.01,
              y: -2,
            }
      }
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {/* Background element */}
      {background && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {background}
        </div>
      )}

      {/* Content */}
      <div className="pointer-events-auto z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300">
        {icon && (
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      </div>

      {/* CTA */}
      {href && (
        <div className="pointer-events-auto z-10 flex items-center px-6 pb-6">
          <a
            href={href}
            className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {cta}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform"
              animate={shouldReduceMotion ? {} : {}}
              whileHover={{ x: 4 }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </motion.svg>
          </a>
        </div>
      )}

      {/* Hover gradient */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(400px circle at 50% 100%, rgba(201, 168, 76, 0.1), transparent 50%)",
          }}
        />
      </div>
    </motion.div>
  );
};
