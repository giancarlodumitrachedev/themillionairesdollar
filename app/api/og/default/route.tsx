import { ImageResponse } from "next/og";
import { getTotalCount } from "@/lib/data";
import { formatCount } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const total = await getTotalCount();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          color: "#f5f3ee",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 200, fontWeight: 300, letterSpacing: "-6px", lineHeight: 1 }}>
          {formatCount(total)}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            letterSpacing: "8px",
            color: "#a8a59e",
            textTransform: "uppercase",
          }}
        >
          Millionaires Exist
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            fontSize: 18,
            letterSpacing: "2px",
            color: "#6b6862",
            fontFamily: "monospace",
          }}
        >
          themillionairesdollar.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
