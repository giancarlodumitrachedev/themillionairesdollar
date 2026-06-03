"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicTile } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { Tile } from "@/components/wall/tile";
import { TileModal } from "@/components/wall/tile-modal";
import { Reveal } from "@/components/ui/reveal";
import { formatCount } from "@/lib/utils";

export function WallPreview({
  tiles,
  total,
}: {
  tiles: PublicTile[];
  total: number;
}) {
  const { dict } = useLocale();
  const [active, setActive] = useState<PublicTile | null>(null);

  return (
    <section className="py-24" aria-labelledby="wall-title">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">{dict.wall.eyebrow}</p>
          <h2
            id="wall-title"
            className="mt-8 font-display text-4xl font-light leading-[1.1] text-[var(--color-text-primary)] sm:text-5xl"
          >
            {dict.wall.title}
          </h2>
          <p className="mt-4 font-body text-base text-[var(--color-text-secondary)]">
            {dict.wall.subtitle}
          </p>
        </Reveal>
      </div>

      {/* Edge-to-edge grid */}
      <div className="mt-12 px-5 md:px-8">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-[6px] lg:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:gap-2">
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} onClick={setActive} />
          ))}
        </div>
      </div>

      <div className="container-editorial mt-12">
        <Link
          href="/wall"
          className="border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          {dict.wall.viewAll(formatCount(total))}
        </Link>
      </div>

      <TileModal tile={active} onClose={() => setActive(null)} />
    </section>
  );
}
