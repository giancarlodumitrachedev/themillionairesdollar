"use client";

import { memo } from "react";
import type { PublicTile } from "@/lib/types";
import { cn, countryName, formatTileNumber, tileLabel, yearOf } from "@/lib/utils";

interface TileProps {
  tile: PublicTile;
  onClick?: (tile: PublicTile) => void;
  /** Render at a larger scale (tile page hero). */
  large?: boolean;
  /** Disable hover/interaction (static contexts like OG previews). */
  static?: boolean;
}

/**
 * A single Wall tile. Anatomy and tier variants per PRD §3.3.
 * - existence: standard
 * - verified:  gold check, top-right
 * - founding:  accent border
 * - permanent: subtle warm elevation
 * - patron:    double border (accent outer)
 */
function TileBase({ tile, onClick, large, static: isStatic }: TileProps) {
  const label = tileLabel(tile);
  const isInitials = tile.display_as === "initials";
  const tier = tile.tier;

  const interactive = Boolean(onClick) && !isStatic;

  return (
    <button
      type={interactive ? "button" : undefined}
      onClick={interactive ? () => onClick?.(tile) : undefined}
      aria-label={`Tile ${formatTileNumber(tile.tile_number)}, ${label}`}
      disabled={!interactive}
      className={cn(
        "group relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-[2px] border bg-[var(--color-bg-elevated)] p-3 text-left transition-all duration-300 sm:p-4",
        "border-[var(--color-border)]",
        tier === "founding" && "border-[var(--color-accent)]",
        tier === "permanent" && "border-[var(--color-border-strong)]",
        tier === "patron" &&
          "border-[var(--color-accent)] ring-1 ring-inset ring-[var(--color-border)] ring-offset-0",
        tile.is_highlighted && "border-[var(--color-accent-bright)]",
        interactive &&
          "cursor-pointer hover:scale-[1.05] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-overlay)]",
        !interactive && "cursor-default"
      )}
      style={
        tier === "permanent"
          ? {
              backgroundImage:
                "linear-gradient(160deg, #141414 0%, #1a1814 100%)",
            }
          : undefined
      }
    >
      {/* Verified mark */}
      {tier === "verified" && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 font-mono text-[10px] text-[var(--color-accent-bright)]"
          title="Verified"
        >
          ✓
        </span>
      )}

      {/* Top: tile number */}
      <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
        {formatTileNumber(tile.tile_number)}
      </span>

      {/* Center: initials or name */}
      <span
        className={cn(
          "flex flex-1 items-center justify-center px-1 text-center font-display font-light leading-tight text-[var(--color-text-primary)]",
          isInitials
            ? large
              ? "text-6xl"
              : "text-2xl sm:text-[28px]"
            : large
              ? "text-3xl"
              : "text-sm sm:text-base"
        )}
      >
        {label}
      </span>

      {/* Bottom: location + year */}
      <span className="flex items-end justify-between gap-2">
        <span className="truncate font-mono text-[9px] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {tile.city ? `${tile.city}, ` : ""}
          {tile.country_code}
        </span>
        <span className="shrink-0 font-mono text-[9px] text-[var(--color-text-tertiary)]">
          {tile.year_became_millionaire ?? yearOf(tile.created_at)}
        </span>
      </span>
    </button>
  );
}

export const Tile = memo(TileBase);

/** Larger, non-interactive presentation for the /tile/[id] hero. */
export function TileHero({ tile }: { tile: PublicTile }) {
  return (
    <div className="mx-auto w-full max-w-[400px]">
      <Tile tile={tile} large static />
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        {countryName(tile.country_code)}
      </p>
    </div>
  );
}
