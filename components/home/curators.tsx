"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Reveal } from "@/components/ui/reveal";

export function Curators() {
  const { dict } = useLocale();

  return (
    <section
      className="py-24 sm:py-[12rem]"
      aria-labelledby="curators-title"
    >
      <div className="container-reading text-center">
        <Reveal>
          <p className="eyebrow">{dict.curators.eyebrow}</p>
          <h2
            id="curators-title"
            className="mx-auto mt-8 max-w-xl font-display text-3xl font-light leading-[1.15] text-[var(--color-text-primary)] sm:text-4xl"
          >
            {dict.curators.title}
          </h2>
        </Reveal>
        <div className="mt-12 space-y-6 text-left">
          {dict.curators.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <p className="font-body text-base leading-[1.7] text-[var(--color-text-secondary)] sm:text-lg">
                {p}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link
            href="/manifesto"
            className="mt-12 inline-block border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            {dict.curators.readManifesto}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
