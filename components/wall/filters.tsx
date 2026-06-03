"use client";

import { COUNTRIES } from "@/lib/countries";
import { TIER_ORDER, TIERS } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface WallFilters {
  country: string;
  yearMin: number | null;
  yearMax: number | null;
  tiers: Tier[];
  order: "newest" | "oldest" | "random";
}

export const DEFAULT_FILTERS: WallFilters = {
  country: "",
  yearMin: null,
  yearMax: null,
  tiers: [],
  order: "newest",
};

export function FiltersBar({
  filters,
  onChange,
  total,
}: {
  filters: WallFilters;
  onChange: (next: WallFilters) => void;
  total: number;
}) {
  function toggleTier(tier: Tier) {
    const has = filters.tiers.includes(tier);
    onChange({
      ...filters,
      tiers: has
        ? filters.tiers.filter((t) => t !== tier)
        : [...filters.tiers, tier],
    });
  }

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] py-4">
      <div className="container-editorial flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Country */}
        <select
          aria-label="Filter by country"
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
          className="appearance-none border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Order */}
        <select
          aria-label="Sort order"
          value={filters.order}
          onChange={(e) =>
            onChange({ ...filters, order: e.target.value as WallFilters["order"] })
          }
          className="appearance-none border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="random">Random</option>
        </select>

        {/* Tier chips */}
        <div className="flex flex-wrap gap-2">
          {TIER_ORDER.map((t) => {
            const active = filters.tiers.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTier(t)}
                aria-pressed={active}
                className={cn(
                  "rounded-[2px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "border-[var(--color-accent)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                )}
              >
                {TIERS[t].name}
              </button>
            );
          })}
        </div>

        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          {new Intl.NumberFormat("en-US").format(total)} tiles
        </span>
      </div>
    </div>
  );
}
