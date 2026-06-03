import { requireAdmin, getVettingQueue } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { VettingQueue } from "@/components/admin/vetting-queue";

export const dynamic = "force-dynamic";

export default async function AdminVettingPage() {
  const { email } = await requireAdmin();
  const rows = await getVettingQueue();

  return (
    <AdminShell email={email}>
      <h1 className="mb-8 font-display text-3xl font-light text-[var(--color-text-primary)]">
        Vetting queue
      </h1>
      <VettingQueue rows={rows} />
    </AdminShell>
  );
}
