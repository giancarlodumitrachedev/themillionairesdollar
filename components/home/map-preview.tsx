"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicTile } from "@/lib/types";
import { useLocale } from "@/components/locale-provider";
import { Reveal } from "@/components/ui/reveal";
import { MAPBOX_TOKEN } from "@/lib/mapbox";
import { formatCount } from "@/lib/utils";

// Lazy-load Mapbox only when the section enters the viewport.
const WorldMap = dynamic(
  () => import("@/components/map/world-map").then((m) => m.WorldMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return <div className="skeleton h-full w-full" aria-hidden="true" />;
}

function MapFallback({ count }: { count: number }) {
  const { dict } = useLocale();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--color-bg-elevated)] p-8 text-center">
      <p className="font-display text-5xl font-light text-[var(--color-text-primary)]">
        {formatCount(count)}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        {dict.map.declarations}
      </p>
      <p className="mt-4 max-w-xs font-body text-sm text-[var(--color-text-tertiary)]">
        The interactive map appears here once configured.
      </p>
    </div>
  );
}

export function MapPreview({
  points,
  total,
}: {
  points: PublicTile[];
  total: number;
}) {
  const { dict } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24" aria-labelledby="map-title">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">{dict.map.eyebrow}</p>
          <h2
            id="map-title"
            className="mt-8 font-display text-4xl font-light leading-[1.1] text-[var(--color-text-primary)] sm:text-5xl"
          >
            {dict.map.title}
          </h2>
          <p className="mt-4 font-body text-base text-[var(--color-text-secondary)]">
            {dict.map.subtitle}
          </p>
        </Reveal>
      </div>

      <div className="container-editorial mt-12">
        <div
          ref={ref}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] border border-[var(--color-border)] sm:aspect-video"
        >
          {inView &&
            (MAPBOX_TOKEN ? (
              <WorldMap points={points} />
            ) : (
              <MapFallback count={total} />
            ))}

          {/* Declarations counter */}
          <div className="pointer-events-none absolute right-4 top-4 z-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
              {formatCount(total)} {dict.map.declarations}
            </span>
          </div>

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2">
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
        </div>

        <Link
          href="/map"
          className="mt-8 inline-block border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          {dict.map.explore}
        </Link>
      </div>
    </section>
  );
}
