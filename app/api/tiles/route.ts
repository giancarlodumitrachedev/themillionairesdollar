import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMockTiles, MOCK_TOTAL } from "@/lib/mock-data";
import { isValidTier } from "@/lib/tiers";
import type { PublicTile } from "@/lib/types";

export const runtime = "nodejs";

const PAGE = 60;

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Apply filters/sort to an array of mock tiles (dev fallback). */
function filterMock(
  tiles: PublicTile[],
  opts: {
    country?: string;
    yearMin?: number;
    yearMax?: number;
    tiers: string[];
    order: string;
  }
): PublicTile[] {
  let out = tiles;
  if (opts.country) out = out.filter((t) => t.country_code === opts.country);
  if (opts.tiers.length) out = out.filter((t) => opts.tiers.includes(t.tier));
  if (opts.yearMin)
    out = out.filter(
      (t) => (t.year_became_millionaire ?? 0) >= opts.yearMin!
    );
  if (opts.yearMax)
    out = out.filter(
      (t) => (t.year_became_millionaire ?? 9999) <= opts.yearMax!
    );
  if (opts.order === "oldest") {
    out = [...out].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  } else if (opts.order === "random") {
    out = [...out].sort((a, b) => (a.id < b.id ? -1 : 1));
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
  const country = url.searchParams.get("country") ?? undefined;
  const yearMin = url.searchParams.get("yearMin")
    ? parseInt(url.searchParams.get("yearMin")!, 10)
    : undefined;
  const yearMax = url.searchParams.get("yearMax")
    ? parseInt(url.searchParams.get("yearMax")!, 10)
    : undefined;
  const order = url.searchParams.get("order") ?? "newest";
  const tiers = (url.searchParams.get("tiers") ?? "")
    .split(",")
    .filter((t) => t && isValidTier(t));

  if (!configured()) {
    const all = filterMock(generateMockTiles(MOCK_TOTAL), {
      country,
      yearMin,
      yearMax,
      tiers,
      order,
    });
    const slice = all.slice(offset, offset + PAGE);
    return NextResponse.json({ tiles: slice, total: all.length, hasMore: offset + PAGE < all.length });
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("public_tiles").select("*", { count: "exact" });

    if (country) query = query.eq("country_code", country);
    if (tiers.length) query = query.in("tier", tiers);
    if (yearMin) query = query.gte("year_became_millionaire", yearMin);
    if (yearMax) query = query.lte("year_became_millionaire", yearMax);

    if (order === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + PAGE - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json({
      tiles: (data as PublicTile[]) ?? [],
      total,
      hasMore: offset + PAGE < total,
    });
  } catch (err) {
    console.error("Tiles API error:", err);
    return NextResponse.json({ tiles: [], total: 0, hasMore: false }, { status: 500 });
  }
}
