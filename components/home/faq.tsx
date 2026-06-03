"use client";

import { useLocale } from "@/components/locale-provider";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";

export function Faq() {
  const { dict } = useLocale();

  return (
    <section className="py-24" aria-labelledby="faq-title">
      <div className="container-reading">
        <Reveal>
          <h2
            id="faq-title"
            className="mb-12 font-display text-3xl font-light text-[var(--color-text-primary)] sm:text-4xl"
          >
            {dict.faq.title}
          </h2>
        </Reveal>
        <Accordion items={dict.faq.items} />
      </div>
    </section>
  );
}
