"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS: Array<{ href: string; key: "wall" | "map" | "manifesto" | "press" }> = [
  { href: "/wall", key: "wall" },
  { href: "/map", key: "map" },
  { href: "/manifesto", key: "manifesto" },
  { href: "/press", key: "press" },
];

export function SiteNav() {
  const { dict, locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
          scrolled || menuOpen
            ? "border-b border-[var(--color-border)] bg-[var(--color-bg)]"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="container-editorial flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-display text-base font-normal tracking-tight text-[var(--color-text-primary)]"
            aria-label="The Millionaire's Dollar — home"
          >
            M.D.
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? dict.nav.close : dict.nav.menu}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={cn(
                "block h-px w-6 bg-[var(--color-text-primary)] transition-transform duration-300",
                menuOpen && "translate-y-[6px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-[var(--color-text-primary)] transition-opacity duration-300",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-px w-6 bg-[var(--color-text-primary)] transition-transform duration-300",
                menuOpen && "-translate-y-[6px] -rotate-45"
              )}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col bg-[var(--color-bg)] pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.05 : 0.3 }}
          >
            <div className="container-editorial flex flex-1 flex-col justify-center gap-2 py-12">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.05 * i + 0.1, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 font-display text-4xl font-light text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent-bright)] sm:text-5xl"
                  >
                    {dict.nav[link.key]}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.3, duration: 0.4 }}
                className="mt-8"
              >
                <Link
                  href="/participate"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block border-b border-[var(--color-accent)] py-2 font-body text-sm uppercase tracking-[0.1em] text-[var(--color-accent-bright)]"
                >
                  {dict.nav.participate}
                </Link>
              </motion.div>
            </div>

            <div className="container-editorial flex items-center justify-between border-t border-[var(--color-border)] py-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                The Curators
              </span>
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em]">
                <button
                  onClick={() => setLocale("it")}
                  className={cn(
                    "transition-colors",
                    locale === "it"
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  )}
                  aria-pressed={locale === "it"}
                >
                  IT
                </button>
                <span className="text-[var(--color-text-tertiary)]">/</span>
                <button
                  onClick={() => setLocale("en")}
                  className={cn(
                    "transition-colors",
                    locale === "en"
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  )}
                  aria-pressed={locale === "en"}
                >
                  EN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
