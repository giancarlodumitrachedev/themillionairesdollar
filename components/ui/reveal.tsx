"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll-triggered reveal: fade-in + slight slide-up when 30% in view.
 * Honours prefers-reduced-motion (collapses to a fast fade).
 * Per PRD §7.2.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: reduce ? 0.1 : 1,
        delay: reduce ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </MotionTag>
  );
}
