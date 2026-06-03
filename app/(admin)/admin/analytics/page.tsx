import { requireAdmin, getAdminOverview, getParticipants } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { countryName, formatCount, formatEur } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { email } = await requireAdmin();
  const [overview, participants] = await Promise.all([
    getAdminOverview(),
    getParticipants(),
  ]);

  // Country breakdown.
  const byCountry = new Map<string, number>();
  for (const p of participants) {
    byCountry.set(p.country_code, (byCountry.get(p.country_code) ?? 0) + 1);
  }
  const topCountries = [...byCountry.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  const maxCountry = Math.max(1, ...topCountries.map(([, c]) => c));

  // 30-day growth.
  const days: Array<{ label: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - i);
    const next = new Date(day);
    next.setUTCDate(next.getUTCDate() + 1);
    const count = participants.filter((p) => {
      const t = new Date(p.created_at).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
    days.push({ label: `${day.getUTCMonth() + 1}/${day.getUTCDate()}`, count });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <AdminShell email={email}>
      <h1 className="mb-8 font-display text-3xl font-light text-[var(--color-text-primary)]">
        Analytics
      </h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Revenue" value={formatEur(overview.totalRevenueCents)} />
        <Card label="Participants" value={formatCount(overview.totalParticipants)} />
        <Card label="Avg / participant" value={formatEur(
          overview.totalParticipants
            ? Math.round(overview.totalRevenueCents / overview.totalParticipants)
            : 0
        )} />
        <Card label="Countries" value={formatCount(overview.countries)} />
      </div>

      {/* Growth */}
      <section className="mt-12">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          Last 30 days
        </h2>
        <div className="flex h-32 items-end gap-1 border-b border-[var(--color-border)]">
          {days.map((d, i) => (
            <div
              key={i}
              className="flex-1 bg-[var(--color-accent)]"
              style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? "2px" : "0" }}
              title={`${d.label}: ${d.count}`}
            />
          ))}
        </div>
      </section>

      {/* Countries */}
      <section className="mt-12">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          Top countries
        </h2>
        <div className="space-y-2">
          {topCountries.map(([code, count]) => (
            <div key={code} className="flex items-center gap-4">
              <span className="w-40 shrink-0 truncate font-body text-sm text-[var(--color-text-secondary)]">
                {countryName(code)}
              </span>
              <div className="h-5 flex-1 bg-[var(--color-bg-elevated)]">
                <div
                  className="h-full bg-[var(--color-accent)]"
                  style={{ width: `${(count / maxCountry) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-[var(--color-text-tertiary)]">
                {count}
              </span>
            </div>
          ))}
          {topCountries.length === 0 && (
            <p className="font-body text-sm text-[var(--color-text-tertiary)]">
              No data yet.
            </p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-light text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}
