"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  /** Full-screen on mobile (used by the Wall tile modal). */
  mobileFullScreen?: boolean;
}

export function Modal({
  open,
  onClose,
  label,
  children,
  mobileFullScreen,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Esc to close + lock scroll + focus management.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Move focus into the dialog.
    ref.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.05 : 0.2 }}
        >
          {/* Backdrop */}
          <button
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 24 }}
            transition={{ duration: reduce ? 0.05 : 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={
              mobileFullScreen
                ? "relative z-10 flex h-full max-h-full w-full flex-col overflow-auto border border-[var(--color-border)] bg-[var(--color-bg-elevated)] sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-md sm:rounded-[4px]"
                : "relative z-10 max-h-[85vh] w-full max-w-md overflow-auto border border-[var(--color-border)] bg-[var(--color-bg-elevated)] sm:rounded-[4px]"
            }
          >
            <div className="flex justify-end p-3">
              <button
                onClick={onClose}
                className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                Close
              </button>
            </div>
            <div className="px-6 pb-8">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
