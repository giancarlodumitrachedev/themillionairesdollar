"use client";

import { useState, useTransition } from "react";
import { TIER_ORDER, TIERS, availableTiers } from "@/lib/tiers";
import type { Tier, TierOverrides } from "@/lib/types";
import { setTierOverride } from "@/app/(admin)/admin/actions";
import { cn, formatEur } from "@/lib/utils";

type State = "on" | "off" | "auto";

export function TierControl({
  overrides,
  revenueCents,
}: {
  overrides: TierOverrides;
  revenueCents: number;
}) {
  const [local, setLocal] = useState<TierOverrides>(overrides);
  const [pending, startTransition] = useTransition();
  const live = availableTiers(revenueCents, local).map((t) => t.id);

  function stateOf(tier: Tier): State {
    const o = local[tier];
    if (o === true) return "on";
    if (o === false) return "off";
    return "auto";
  }

  function change(tier: Tier, next: State) {
    setLocal((prev) => {
      const copy = { ...prev };
      if (next === "auto") delete copy[tier];
      else copy[tier] = next === "on";
      return copy;
    });
    startTransition(async () => void (await setTierOverride(tier, next)));
  }

  return (
    <div className="space-y-3">
      {TIER_ORDER.map((t) => {
        const cfg = TIERS[t];
        const current = stateOf(t);
        const isLive = live.includes(t);
        return (
          <div
            key={t}
            className="flex flex-wrap items-center justify-between gap-4 border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
                {cfg.name} · {cfg.priceLabel}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                unlocks at {formatEur(cfg.unlockRevenueCents)} ·{" "}
                {isLive ? "visible" : "hidden"}
              </p>
            </div>
            <div className="flex gap-1">
              {(["auto", "on", "off"] as State[]).map((s) => (
                <button
                  key={s}
                  disabled={pending}
                  onClick={() => change(t, s)}
                  className={cn(
                    "rounded-[2px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors disabled:opacity-50",
                    current === s
                      ? "border-[var(--color-accent)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
