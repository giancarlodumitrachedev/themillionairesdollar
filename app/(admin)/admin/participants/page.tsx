import { requireAdmin, getParticipants } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ParticipantsTable } from "@/components/admin/participants-table";

export const dynamic = "force-dynamic";

export default async function AdminParticipantsPage() {
  const { email } = await requireAdmin();
  const rows = await getParticipants();

  return (
    <AdminShell email={email}>
      <h1 className="mb-8 font-display text-3xl font-light text-[var(--color-text-primary)]">
        Participants
      </h1>
      <ParticipantsTable rows={rows} />
    </AdminShell>
  );
}
