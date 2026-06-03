"use client";

import { useLocale } from "@/components/locale-provider";
import { Reveal } from "@/components/ui/reveal";

export function Question() {
  const { dict } = useLocale();

  return (
    <section className="py-24 sm:py-[12rem]" aria-labelledby="question-title">
      <div className="container-reading">
        <Reveal>
          <h2
            id="question-title"
            className="mb-16 font-display text-3xl font-normal italic leading-[1.15] text-[var(--color-text-primary)] sm:text-5xl"
          >
            {dict.question.title}
          </h2>
        </Reveal>
        <div className="space-y-6">
          {dict.question.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.2}>
              <p className="font-body text-base leading-[1.7] text-[var(--color-text-secondary)] sm:text-lg">
                {p}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
