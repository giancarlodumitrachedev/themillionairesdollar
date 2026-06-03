import { ImageResponse } from "next/og";
import { getTile } from "@/lib/data";
import {
  countryName,
  formatTileNumber,
  tileLabel,
  yearOf,
} from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tile = await getTile(id);

  if (!tile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            background: "#0a0a0a",
            color: "#f5f3ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "serif",
            fontSize: 48,
          }}
        >
          The Millionaire&apos;s Dollar
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const label = tileLabel(tile);
  const meta = [
    tile.city ? `${tile.city}, ${countryName(tile.country_code)}` : countryName(tile.country_code),
    tile.year_became_millionaire ?? yearOf(tile.created_at),
  ].join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          color: "#f5f3ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* The tile, rendered large */}
        <div
          style={{
            width: 380,
            height: 380,
            border: "1px solid #2a2a2a",
            background: "#141414",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 32,
          }}
        >
          <div style={{ fontSize: 22, color: "#6b6862", fontFamily: "monospace" }}>
            {formatTileNumber(tile.tile_number)}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: tile.display_as === "initials" ? 120 : 48,
              fontWeight: 300,
              textAlign: "center",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#6b6862",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            {meta}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 48,
            fontSize: 18,
            letterSpacing: "3px",
            color: "#6b6862",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          The Millionaire&apos;s Dollar
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
