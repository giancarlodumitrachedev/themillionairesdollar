"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { VettingStatus } from "@/lib/types";

const VALID: VettingStatus[] = [
  "none",
  "pending",
  "in_progress",
  "approved",
  "rejected",
];

export async function updateVetting(
  id: string,
  status: VettingStatus,
  note: string
): Promise<{ ok: boolean }> {
  const { email } = await requireAdmin();
  if (!VALID.includes(status)) return { ok: false };

  const supabase = await createClient();

  // Append a timestamped note into vetting_notes JSON.
  const { data: existing } = await supabase
    .from("participants")
    .select("vetting_notes")
    .eq("id", id)
    .maybeSingle();

  const notes = (existing?.vetting_notes as Record<string, unknown>) ?? {};
  if (note.trim()) {
    notes[new Date().toISOString()] = { by: email, note: note.trim() };
  }

  const { error } = await supabase
    .from("participants")
    .update({ vetting_status: status, vetting_notes: notes })
    .eq("id", id);

  if (error) return { ok: false };

  await supabase.from("admin_log").insert({
    admin_email: email,
    action: "vetting_update",
    target_table: "participants",
    target_id: id,
    details: { status, note: note.trim() || null },
  });

  revalidatePath("/admin/vetting");
  return { ok: true };
}
