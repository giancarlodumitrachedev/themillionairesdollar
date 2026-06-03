import { requireAdmin } from "@/lib/admin";
import { getPressCoverage } from "@/lib/data";
import { AdminShell } from "@/components/admin/admin-shell";
import { PressManager } from "@/components/admin/press-manager";

export const dynamic = "force-dynamic";

export default async function AdminPressPage() {
  const { email } = await requireAdmin();
  const rows = await getPressCoverage();

  return (
    <AdminShell email={email}>
      <h1 className="mb-8 font-display text-3xl font-light text-[var(--color-text-primary)]">
        Press tracker
      </h1>
      <PressManager initial={rows} />
    </AdminShell>
  );
}
