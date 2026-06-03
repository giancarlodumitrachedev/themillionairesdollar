"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/locale-provider";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";
import { formatCount } from "@/lib/utils";

/** easeOutExpo for the count-up. */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useCountUp(target: number, durationMs: number, enabled: boolean) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      setValue(Math.round(easeOutExpo(progress) * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs, enabled]);

  return value;
}

export function Hero({ initialCount }: { initialCount: number }) {
  const { dict } = useLocale();
  const reduce = useReducedMotion();
  const { count, justIncremented } = useRealtimeCounter(initialCount);
  const displayed = useCountUp(count, 2000, !reduce);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-16 pt-20"
      aria-label="The Millionaire's Dollar"
    >
      <div className="flex flex-col items-center text-center">
        {/* Counter */}
        <motion.p
          aria-live="polite"
          aria-atomic="true"
          className="font-display font-light leading-[0.95] tracking-[-0.03em] text-[var(--color-text-primary)] tabular-nums transition-colors duration-300"
          style={{
            fontSize: "clamp(6rem, 22vw, 12rem)",
            color: justIncremented ? "var(--color-accent-bright)" : undefined,
          }}
        >
          {formatCount(displayed)}
        </motion.p>

        {/* Label */}
        <p className="mt-4 font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)] sm:text-sm">
          {dict.hero.label}
        </p>

        {/* Sublines */}
        <div className="mt-12 sm:mt-20">
          <p className="font-display text-lg font-light italic text-[var(--color-text-primary)] sm:text-2xl">
            {dict.hero.sublinePrimary}
          </p>
          <p className="mt-2 font-display text-lg font-light italic text-[var(--color-text-secondary)] sm:text-2xl">
            {dict.hero.sublineSecondary}
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="block h-[60px] w-px bg-[var(--color-text-tertiary)]"
          style={{ animation: "pulse-line 2s ease-in-out infinite" }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
          {dict.hero.scroll}
        </span>
      </div>
    </section>
  );
}
