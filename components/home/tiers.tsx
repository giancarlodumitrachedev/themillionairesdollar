"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { Reveal } from "@/components/ui/reveal";
import { availableTiers, type TierConfig } from "@/lib/tiers";
import type { TierOverrides } from "@/lib/types";

function TierCard({ tier }: { tier: TierConfig }) {
  const { dict, locale } = useLocale();
  const description = locale === "it" ? tier.descriptionIt : tier.description;

  return (
    <div className="group flex min-h-[480px] flex-col rounded-[2px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 transition-colors duration-300 hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-overlay)]">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        {tier.name}
      </p>
      <p className="mt-4 font-display text-6xl font-light text-[var(--color-text-primary)]">
        {tier.priceLabel}
      </p>
      <p className="mt-6 flex-1 font-body text-sm leading-[1.6] text-[var(--color-text-secondary)]">
        {description}
      </p>
      <Link
        href={`/participate?tier=${tier.id}`}
        className="mt-8 inline-flex w-full items-center justify-center rounded-[2px] border border-[var(--color-text-primary)] bg-[var(--color-bg)] px-8 py-4 font-body text-sm font-medium uppercase tracking-[0.1em] text-[var(--color-text-primary)] transition-colors duration-300 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
      >
        {dict.tiers.cta}
      </Link>
    </div>
  );
}

export function Tiers({
  revenueCents,
  overrides = {},
}: {
  revenueCents: number;
  overrides?: TierOverrides;
}) {
  const { dict } = useLocale();
  const tiers = availableTiers(revenueCents, overrides);

  return (
    <section className="py-24 sm:py-[12rem]" aria-labelledby="tiers-title">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">{dict.tiers.eyebrow}</p>
          <h2
            id="tiers-title"
            className="mt-8 font-display text-4xl font-light leading-[1.1] text-[var(--color-text-primary)] sm:text-5xl"
          >
            {dict.tiers.title}
          </h2>
          <p className="mt-4 font-body text-base text-[var(--color-text-secondary)]">
            {dict.tiers.subtitle}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.08}>
              <TierCard tier={tier} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
