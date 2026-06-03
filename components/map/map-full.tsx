"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { PublicTile } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { MAPBOX_TOKEN } from "@/lib/mapbox";
import { formatCount } from "@/lib/utils";

const WorldMap = dynamic(
  () => import("@/components/map/world-map").then((m) => m.WorldMap),
  { ssr: false, loading: () => <div className="skeleton h-full w-full" /> }
);

export function MapFull({
  points,
  total,
}: {
  points: PublicTile[];
  total: number;
}) {
  const { dict } = useLocale();

  return (
    <div className="fixed inset-0 top-16">
      {MAPBOX_TOKEN ? (
        <WorldMap points={points} compact />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--color-bg)] text-center">
          <p className="font-display text-6xl font-light text-[var(--color-text-primary)]">
            {formatCount(total)}
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            {dict.map.declarations}
          </p>
        </div>
      )}

      {/* Counter — top center */}
      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
          {formatCount(total)} {dict.map.declarations}
        </span>
      </div>

      {/* Legend — bottom left */}
      <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-2">
        <span
          className="inline-block h-[6px] w-[6px] rounded-full"
          style={{
            backgroundColor: "var(--color-accent)",
            boxShadow: "0 0 8px 2px rgba(139,115,85,0.4)",
          }}
          aria-hidden="true"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
          {dict.map.legend}
        </span>
      </div>

      {/* Participate — bottom right */}
      <Link
        href="/participate"
        className="absolute bottom-6 right-6 rounded-[2px] border border-[var(--color-text-primary)] bg-[var(--color-bg)]/80 px-5 py-3 font-body text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-text-primary)] backdrop-blur transition-colors hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]"
      >
        {dict.common.addYourself}
      </Link>
    </div>
  );
}
