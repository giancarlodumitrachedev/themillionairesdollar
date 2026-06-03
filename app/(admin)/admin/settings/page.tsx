import { requireAdmin } from "@/lib/admin";
import { getTierOverrides, getTotalRevenueCents } from "@/lib/data";
import { AdminShell } from "@/components/admin/admin-shell";
import { TierControl } from "@/components/admin/tier-control";
import { EmailBlast } from "@/components/admin/email-blast";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { email } = await requireAdmin();
  const [overrides, revenue] = await Promise.all([
    getTierOverrides(),
    getTotalRevenueCents(),
  ]);

  return (
    <AdminShell email={email}>
      <h1 className="mb-8 font-display text-3xl font-light text-[var(--color-text-primary)]">
        Settings
      </h1>

      <section className="mb-16">
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          Tier control
        </h2>
        <TierControl overrides={overrides} revenueCents={revenue} />
      </section>

      <section>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          Email blast
        </h2>
        <EmailBlast />
      </section>
    </AdminShell>
  );
}
