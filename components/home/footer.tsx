"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/lib/utils";

function NewsletterForm() {
  const { dict } = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="font-body text-sm text-[var(--color-text-secondary)]">
        ✓ Thank you. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <Input
        label={dict.footer.newsletterPlaceholder}
        hideLabel
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={dict.footer.newsletterPlaceholder}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        error={
          state === "error" ? "Please enter a valid email." : undefined
        }
      />
      <Button type="submit" disabled={state === "loading"} className="py-3">
        {state === "loading" ? "…" : dict.footer.subscribe}
      </Button>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        {dict.footer.newsletterMicrocopy}
      </p>
    </form>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block py-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const { dict, locale, setLocale } = useLocale();

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="container-editorial pb-12 pt-24">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-3xl text-[var(--color-text-primary)]">
              M.D.
            </p>
            <p className="mt-2 font-body text-sm text-[var(--color-text-secondary)]">
              {dict.footer.tagline}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              {dict.footer.byline}
            </p>
          </div>

          {/* Explore */}
          <nav aria-label={dict.footer.explore}>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              {dict.footer.explore}
            </h2>
            <FooterLink href="/wall">{dict.nav.wall}</FooterLink>
            <FooterLink href="/map">{dict.nav.map}</FooterLink>
            <FooterLink href="/manifesto">{dict.nav.manifesto}</FooterLink>
            <FooterLink href="/press">{dict.nav.press}</FooterLink>
          </nav>

          {/* Legal */}
          <nav aria-label={dict.footer.legal}>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              {dict.footer.legal}
            </h2>
            <FooterLink href="/privacy">{dict.footer.privacy}</FooterLink>
            <FooterLink href="/terms">{dict.footer.terms}</FooterLink>
            <FooterLink href="/manifesto">{dict.footer.contact}</FooterLink>
          </nav>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              {dict.footer.newsletterHeading}
            </h2>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
            {dict.footer.copyright}
          </p>
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
      </div>
    </footer>
  );
}
