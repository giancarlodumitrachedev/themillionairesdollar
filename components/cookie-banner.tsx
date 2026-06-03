"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

const KEY = "md_cookie_ack";

/**
 * Minimal, GDPR-honest cookie notice. We only set a functional language cookie
 * and (in admin) auth cookies — no consent gate is legally required, so this is
 * a dismissible notice rather than a blocking banner.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function ack() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] p-4"
          role="region"
          aria-label="Cookie notice"
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="font-body text-xs leading-relaxed text-[var(--color-text-secondary)]">
              We use one functional cookie for your language and no tracking.{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--color-text-primary)]">
                Privacy
              </Link>
              .
            </p>
            <button
              onClick={ack}
              className="shrink-0 rounded-[2px] border border-[var(--color-text-primary)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
            >
              Understood
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
