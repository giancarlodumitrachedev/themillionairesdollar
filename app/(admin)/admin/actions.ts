"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { sendNewsletterEmail } from "@/lib/resend";
import { isValidTier } from "@/lib/tiers";
import type { Tier, TierOverrides } from "@/lib/types";

async function log(
  action: string,
  details: Record<string, unknown>,
  targetId?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("admin_log").insert({
    admin_email: user?.email ?? "unknown",
    action,
    target_table: "admin",
    target_id: targetId ?? null,
    details,
  });
}

/* ---------------- Press tracker ---------------- */

export async function upsertPress(input: {
  id?: string;
  publication_name: string;
  article_url: string;
  article_title: string;
  quote?: string;
  publication_logo_url?: string;
  is_featured?: boolean;
  display_order?: number;
}): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = await createClient();
  const row = {
    publication_name: input.publication_name,
    article_url: input.article_url,
    article_title: input.article_title,
    quote: input.quote || null,
    publication_logo_url: input.publication_logo_url || null,
    is_featured: Boolean(input.is_featured),
    display_order: input.display_order ?? 0,
  };
  const { error } = input.id
    ? await supabase.from("press_coverage").update(row).eq("id", input.id)
    : await supabase.from("press_coverage").insert(row);
  if (error) return { ok: false };
  await log("press_upsert", { name: input.publication_name });
  revalidatePath("/admin/press");
  revalidatePath("/press");
  revalidatePath("/");
  return { ok: true };
}

export async function deletePress(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("press_coverage").delete().eq("id", id);
  if (error) return { ok: false };
  await log("press_delete", {}, id);
  revalidatePath("/admin/press");
  revalidatePath("/press");
  return { ok: true };
}

/* ---------------- Tier control ---------------- */

export async function setTierOverride(
  tier: Tier,
  state: "on" | "off" | "auto"
): Promise<{ ok: boolean }> {
  await requireAdmin();
  if (!isValidTier(tier)) return { ok: false };
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "tier_overrides")
    .maybeSingle();

  const current = ((data?.value as TierOverrides) ?? {}) as TierOverrides;
  if (state === "auto") delete current[tier];
  else current[tier] = state === "on";

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "tier_overrides", value: current, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) return { ok: false };
  await log("tier_override", { tier, state });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/participate");
  return { ok: true };
}

/* ---------------- Email blast ---------------- */

export async function sendEmailBlast(input: {
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; sent: number }> {
  await requireAdmin();
  if (!input.subject || !input.html) return { ok: false, sent: 0 };
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null);

  const emails = (data ?? []).map((r) => (r as { email: string }).email);
  let sent = 0;
  for (const email of emails) {
    try {
      await sendNewsletterEmail(email, input.subject, input.html, input.text);
      sent++;
    } catch {
      /* continue */
    }
  }
  await log("newsletter_send", { subject: input.subject, recipients: sent });
  return { ok: true, sent };
}

/* ---------------- Wall management ---------------- */

export async function setParticipantFlags(
  id: string,
  flags: { is_public?: boolean; is_highlighted?: boolean }
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("participants").update(flags).eq("id", id);
  if (error) return { ok: false };
  await log("wall_manage", flags, id);
  revalidatePath("/admin/participants");
  revalidatePath("/wall");
  revalidatePath("/");
  return { ok: true };
}
