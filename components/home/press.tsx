"use client";

/* eslint-disable @next/next/no-img-element */
import type { PressCoverage } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { Reveal } from "@/components/ui/reveal";

/**
 * Press section. The parent only renders this when coverage.length > 0
 * (PRD §3.7), but we guard here too.
 */
export function Press({ coverage }: { coverage: PressCoverage[] }) {
  const { dict } = useLocale();
  if (coverage.length === 0) return null;

  const featured = coverage.filter((c) => c.quote && c.is_featured).slice(0, 3);

  return (
    <section className="py-24" aria-labelledby="press-title">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">{dict.press.eyebrow}</p>
          <h2
            id="press-title"
            className="mt-8 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl"
          >
            {dict.press.title}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 items-center gap-16 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {coverage.map((c) => {
            const logo = (
              <span
                className="block font-display text-2xl text-[var(--color-text-secondary)] transition-colors duration-300 group-hover:text-[var(--color-text-primary)]"
              >
                {c.publication_name}
              </span>
            );
            const inner = c.publication_logo_url ? (
              <img
                src={c.publication_logo_url}
                alt={c.publication_name}
                className="max-h-10 w-auto opacity-70 brightness-[0.7] grayscale transition-all duration-300 group-hover:opacity-100 group-hover:brightness-100"
                loading="lazy"
              />
            ) : (
              logo
            );
            return (
              <a
                key={c.id}
                href={c.article_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center"
                title={c.article_title}
              >
                {inner}
              </a>
            );
          })}
        </div>

        {featured.length > 0 && (
          <div className="mt-24 space-y-16">
            {featured.map((c) => (
              <Reveal key={c.id}>
                <figure className="mx-auto max-w-2xl text-center">
                  <blockquote className="font-display text-2xl font-light italic leading-snug text-[var(--color-text-primary)]">
                    “{c.quote}”
                  </blockquote>
                  <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
                    {c.publication_name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
