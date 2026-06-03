"use client";

import Link from "next/link";
import type { PublicTile } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { useLocale } from "@/components/locale-provider";
import { TIERS } from "@/lib/tiers";
import {
  countryName,
  formatLongDate,
  formatTileNumber,
  tileLabel,
} from "@/lib/utils";

export function TileModal({
  tile,
  onClose,
}: {
  tile: PublicTile | null;
  onClose: () => void;
}) {
  const { dict, locale } = useLocale();

  return (
    <Modal
      open={Boolean(tile)}
      onClose={onClose}
      label={tile ? `Tile ${formatTileNumber(tile.tile_number)}` : "Tile"}
      mobileFullScreen
    >
      {tile && (
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            {formatTileNumber(tile.tile_number)}
          </p>

          <p className="mt-6 font-display text-5xl font-light text-[var(--color-text-primary)]">
            {tileLabel(tile)}
          </p>

          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
            {tile.city ? `${tile.city} · ` : ""}
            {countryName(tile.country_code)}
            {tile.year_became_millionaire
              ? ` · ${tile.year_became_millionaire}`
              : ""}
          </p>

          {tile.personal_message && (
            <p className="mt-8 max-w-xs font-display text-2xl font-light italic leading-snug text-[var(--color-text-primary)]">
              “{tile.personal_message}”
            </p>
          )}

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
            {TIERS[tile.tier].name}
          </p>

          <p className="mt-2 font-body text-sm text-[var(--color-text-tertiary)]">
            {dict.common.joinedOn(formatLongDate(tile.created_at, locale === "it" ? "it-IT" : "en-GB"))}
          </p>

          <Link
            href={`/tile/${tile.id}`}
            className="mt-8 border-b border-[var(--color-border-strong)] pb-1 font-body text-sm uppercase tracking-[0.1em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            View tile page →
          </Link>
        </div>
      )}
    </Modal>
  );
}
