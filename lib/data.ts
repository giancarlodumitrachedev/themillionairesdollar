import "server-only";
import type {
  PressCoverage,
  PublicStats,
  PublicTile,
  TierOverrides,
} from "./types";
import { generateMockTiles, MOCK_TOTAL } from "./mock-data";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

/**
 * Data-access layer. Every function gracefully falls back to deterministic mock
 * data when Supabase env vars are absent, so the site renders end-to-end during
 * development and before the wall is populated.
 */

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** The public-safe view exposes only non-sensitive columns. */
const PUBLIC_VIEW = "public_tiles";

/** Total public participants — drives the hero counter. */
export async function getTotalCount(): Promise<number> {
  if (!supabaseConfigured()) return MOCK_TOTAL;
  try {
    const supabase = await createClient();
    // Fast path: the live counter row.
    const { data, error } = await supabase
      .from("counters")
      .select("value")
      .eq("id", "participants_total")
      .maybeSingle();
    if (error) throw error;
    const row = data as { value: number } | null;
    if (row && typeof row.value === "number") return row.value;

    // Fallback: count the view directly.
    const { count } = await supabase
      .from(PUBLIC_VIEW)
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return MOCK_TOTAL;
  }
}

/** A page of public tiles, newest first. */
export async function getTiles(limit = 60, offset = 0): Promise<PublicTile[]> {
  if (!supabaseConfigured()) {
    return generateMockTiles(MOCK_TOTAL).slice(offset, offset + limit);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(PUBLIC_VIEW)
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data as PublicTile[]) ?? [];
  } catch {
    return generateMockTiles(limit).slice(offset, offset + limit);
  }
}

/** Every public tile that has coordinates — for the map. Capped for safety. */
export async function getMapPoints(limit = 10000): Promise<PublicTile[]> {
  if (!supabaseConfigured()) {
    return generateMockTiles(Math.min(MOCK_TOTAL, 2000));
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(PUBLIC_VIEW)
      .select("*")
      .not("latitude", "is", null)
      .limit(limit);
    if (error) throw error;
    return (data as PublicTile[]) ?? [];
  } catch {
    return generateMockTiles(2000);
  }
}

/** A single tile by id, for /tile/[id] and OG generation. */
export async function getTile(id: string): Promise<PublicTile | null> {
  if (!supabaseConfigured() || id.startsWith("mock-")) {
    const n = Number(id.replace("mock-", "")) || 1;
    const all = generateMockTiles(Math.max(n, 50));
    return all.find((t) => t.tile_number === n) ?? all[0] ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(PUBLIC_VIEW)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as PublicTile | null) ?? null;
  } catch {
    return null;
  }
}

/** Aggregate public stats (countries, last 24h, etc.). */
export async function getPublicStats(): Promise<PublicStats> {
  const fallback: PublicStats = {
    total_participants: MOCK_TOTAL,
    last_24h: 213,
    last_week: 1492,
    countries: 74,
    by_country: {},
  };
  if (!supabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallback;
  }
  try {
    // public_stats is not exposed on the public API; read it server-side.
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("public_stats")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (data as PublicStats | null) ?? fallback;
  } catch {
    return fallback;
  }
}

/** Press coverage. Empty array hides the homepage Press section entirely. */
export async function getPressCoverage(): Promise<PressCoverage[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("press_coverage")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as PressCoverage[]) ?? [];
  } catch {
    return [];
  }
}

/** Admin tier enable/disable overrides. */
export async function getTierOverrides(): Promise<TierOverrides> {
  if (!supabaseConfigured()) return {};
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "tier_overrides")
      .maybeSingle();
    if (error) throw error;
    const row = data as { value: TierOverrides } | null;
    return row?.value ?? {};
  } catch {
    return {};
  }
}

/** Cumulative revenue in cents — drives tier availability. */
export async function getTotalRevenueCents(): Promise<number> {
  if (!supabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("counters")
      .select("value")
      .eq("id", "revenue_total_cents")
      .maybeSingle();
    if (error) throw error;
    const row = data as { value: number } | null;
    return row?.value ?? 0;
  } catch {
    return 0;
  }
}
