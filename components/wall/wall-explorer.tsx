"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeGrid, type GridChildComponentProps } from "react-window";
import type { PublicTile } from "@/lib/types";
import { Tile } from "@/components/wall/tile";
import { TileModal } from "@/components/wall/tile-modal";
import {
  DEFAULT_FILTERS,
  FiltersBar,
  type WallFilters,
} from "@/components/wall/filters";

const GAP = 8;
const MIN_TILE = 150;
const MAX_TILE = 200;

function buildQuery(filters: WallFilters, offset: number): string {
  const p = new URLSearchParams({ offset: String(offset), order: filters.order });
  if (filters.country) p.set("country", filters.country);
  if (filters.yearMin) p.set("yearMin", String(filters.yearMin));
  if (filters.yearMax) p.set("yearMax", String(filters.yearMax));
  if (filters.tiers.length) p.set("tiers", filters.tiers.join(","));
  return p.toString();
}

export function WallExplorer({
  initialTiles,
  initialTotal,
}: {
  initialTiles: PublicTile[];
  initialTotal: number;
}) {
  const [filters, setFilters] = useState<WallFilters>(DEFAULT_FILTERS);
  const [tiles, setTiles] = useState<PublicTile[]>(initialTiles);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialTiles.length < initialTotal);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<PublicTile | null>(null);

  const [dims, setDims] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Measure available grid area.
  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDims({ width: rect.width, height: window.innerHeight - rect.top });
    }
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // Refetch when filters change.
  const load = useCallback(
    async (f: WallFilters, offset: number, replace: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await fetch(`/api/tiles?${buildQuery(f, offset)}`);
        const data = (await res.json()) as {
          tiles: PublicTile[];
          total: number;
          hasMore: boolean;
        };
        setTiles((prev) => (replace ? data.tiles : [...prev, ...data.tiles]));
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        /* keep current */
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    void load(filters, 0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Grid geometry.
  const columnCount = Math.max(
    1,
    Math.min(
      Math.floor((dims.width + GAP) / (MIN_TILE + GAP)) || 1,
      Math.floor((dims.width + GAP) / (Math.max(MIN_TILE, 1) + GAP)) || 1
    )
  );
  const cellSize = Math.min(
    MAX_TILE + GAP,
    Math.floor(dims.width / Math.max(columnCount, 1))
  );
  const rowCount = Math.ceil(tiles.length / columnCount);

  const onItemsRendered = useMemo(
    () =>
      ({ visibleRowStopIndex }: { visibleRowStopIndex: number }) => {
        if (
          hasMore &&
          !loadingRef.current &&
          visibleRowStopIndex >= rowCount - 3
        ) {
          void load(filters, tiles.length, false);
        }
      },
    [hasMore, rowCount, tiles.length, filters, load]
  );

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      const index = rowIndex * columnCount + columnIndex;
      const tile = tiles[index];
      if (!tile) return <div style={style} />;
      return (
        <div style={{ ...style, padding: GAP / 2 }}>
          <Tile tile={tile} onClick={setActive} />
        </div>
      );
    },
    [tiles, columnCount]
  );

  return (
    <>
      <div className="sticky top-16 z-20">
        <FiltersBar filters={filters} onChange={setFilters} total={total} />
      </div>

      <div ref={containerRef} className="px-2">
        {dims.width > 0 && tiles.length > 0 && (
          <FixedSizeGrid
            columnCount={columnCount}
            columnWidth={cellSize}
            rowCount={rowCount}
            rowHeight={cellSize}
            height={Math.max(dims.height, 400)}
            width={dims.width}
            onItemsRendered={onItemsRendered}
            className="no-scrollbar"
          >
            {Cell}
          </FixedSizeGrid>
        )}
        {tiles.length === 0 && !loading && (
          <p className="py-24 text-center font-body text-sm text-[var(--color-text-tertiary)]">
            No tiles match these filters.
          </p>
        )}
      </div>

      <TileModal tile={active} onClose={() => setActive(null)} />
    </>
  );
}
