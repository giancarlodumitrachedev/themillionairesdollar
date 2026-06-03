import { requireAdmin, getAdminOverview } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatsOverview } from "@/components/admin/stats-overview";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { email } = await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <AdminShell email={email}>
      <h1 className="mb-8 font-display text-3xl font-light text-[var(--color-text-primary)]">
        Overview
      </h1>
      <StatsOverview overview={overview} />
    </AdminShell>
  );
}
