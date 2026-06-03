import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Participant, Tier } from "./types";

export interface AdminContext {
  email: string;
}

/**
 * Gate a server component to whitelisted admins. Redirects to the login page
 * otherwise. The DB whitelist is the source of truth; the env var is a
 * convenience fallback for first-run before the table is seeded.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/admin/login");

  const email = user.email.toLowerCase();

  // Whitelist check (DB first, env fallback).
  const { data: row } = await supabase
    .from("admin_whitelist")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  const envList = (process.env.ADMIN_WHITELIST_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!row && !envList.includes(email)) {
    redirect("/admin/login?error=forbidden");
  }

  return { email };
}

export interface AdminOverview {
  totalParticipants: number;
  totalRevenueCents: number;
  byTier: Record<Tier, { count: number; revenueCents: number }>;
  last24h: number;
  countries: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("tier, amount_paid_cents, country_code, created_at, is_public");

  const rows = (data ?? []) as Array<
    Pick<
      Participant,
      "tier" | "amount_paid_cents" | "country_code" | "created_at" | "is_public"
    >
  >;

  const byTier = {} as AdminOverview["byTier"];
  let totalRevenue = 0;
  let last24h = 0;
  const countries = new Set<string>();
  const dayAgo = Date.now() - 24 * 3600 * 1000;

  for (const r of rows) {
    totalRevenue += r.amount_paid_cents;
    countries.add(r.country_code);
    if (new Date(r.created_at).getTime() > dayAgo) last24h++;
    const t = r.tier as Tier;
    byTier[t] ??= { count: 0, revenueCents: 0 };
    byTier[t].count++;
    byTier[t].revenueCents += r.amount_paid_cents;
  }

  return {
    totalParticipants: rows.length,
    totalRevenueCents: totalRevenue,
    byTier,
    last24h,
    countries: countries.size,
  };
}

export async function getParticipants(): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);
  return (data as Participant[]) ?? [];
}

export async function getVettingQueue(): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("*")
    .in("vetting_status", ["pending", "in_progress"])
    .order("created_at", { ascending: true });
  return (data as Participant[]) ?? [];
}
