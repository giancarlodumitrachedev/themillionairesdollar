import type { AdminOverview } from "@/lib/admin";
import { TIER_ORDER, TIERS } from "@/lib/tiers";
import { formatCount, formatEur } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-light text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

export function StatsOverview({ overview }: { overview: AdminOverview }) {
  const maxRevenue = Math.max(
    1,
    ...TIER_ORDER.map((t) => overview.byTier[t]?.revenueCents ?? 0)
  );

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={formatEur(overview.totalRevenueCents)} />
        <Stat label="Participants" value={formatCount(overview.totalParticipants)} />
        <Stat label="Last 24h" value={formatCount(overview.last24h)} />
        <Stat label="Countries" value={formatCount(overview.countries)} />
      </div>

      <div>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          By tier
        </h2>
        <div className="space-y-3">
          {TIER_ORDER.map((t) => {
            const row = overview.byTier[t] ?? { count: 0, revenueCents: 0 };
            const pct = (row.revenueCents / maxRevenue) * 100;
            return (
              <div key={t} className="flex items-center gap-4">
                <span className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
                  {TIERS[t].name}
                </span>
                <div className="h-6 flex-1 bg-[var(--color-bg-elevated)]">
                  <div
                    className="h-full bg-[var(--color-accent)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-[var(--color-text-tertiary)]">
                  {row.count}
                </span>
                <span className="w-24 shrink-0 text-right font-mono text-xs text-[var(--color-text-secondary)]">
                  {formatEur(row.revenueCents)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
