import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTile } from "@/lib/data";
import { TileHero } from "@/components/wall/tile";
import { Footer } from "@/components/home/footer";
import { TIERS } from "@/lib/tiers";
import {
  countryName,
  formatLongDate,
  formatTileNumber,
  tileLabel,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tile = await getTile(id);
  if (!tile) return { title: "Tile not found" };

  const label = tileLabel(tile);
  const title = `${formatTileNumber(tile.tile_number)} — ${label}`;
  const description = `${label} declared they exist. ${countryName(
    tile.country_code
  )}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/api/og/tile/${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/tile/${id}`],
    },
  };
}

export default async function TilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tile = await getTile(id);
  if (!tile) notFound();

  return (
    <>
      <section className="flex min-h-[80svh] flex-col items-center justify-center px-5 pt-24">
        <TileHero tile={tile} />

        <div className="mt-12 max-w-md text-center">
          <p className="font-display text-4xl font-light text-[var(--color-text-primary)]">
            {tileLabel(tile)}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
            {tile.city ? `${tile.city} · ` : ""}
            {countryName(tile.country_code)}
            {tile.year_became_millionaire ? ` · ${tile.year_became_millionaire}` : ""}
          </p>

          {tile.personal_message && (
            <p className="mt-8 font-display text-2xl font-light italic leading-snug text-[var(--color-text-primary)]">
              “{tile.personal_message}”
            </p>
          )}

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
            {TIERS[tile.tier].name}
          </p>
          <p className="mt-1 font-body text-sm text-[var(--color-text-tertiary)]">
            Joined the Wall on {formatLongDate(tile.created_at)}
          </p>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Link
              href="/participate"
              className="inline-flex items-center justify-center rounded-[2px] border border-[var(--color-text-primary)] bg-[var(--color-bg)] px-8 py-4 font-body text-sm font-medium uppercase tracking-[0.1em] text-[var(--color-text-primary)] transition-colors duration-300 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
            >
              Add yourself
            </Link>
            <Link
              href="/wall"
              className="border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              Back to the Wall →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
