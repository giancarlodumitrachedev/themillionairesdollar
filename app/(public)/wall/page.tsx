import type { Metadata } from "next";
import { WallExplorer } from "@/components/wall/wall-explorer";
import { getTiles, getTotalCount } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Wall",
  description: "Every tile is a person who declared they exist.",
};

export const revalidate = 60;

export default async function WallPage() {
  const [tiles, total] = await Promise.all([getTiles(60), getTotalCount()]);

  return (
    <div className="pt-16">
      <div className="container-editorial py-8">
        <p className="eyebrow">01 — The Wall</p>
        <h1 className="mt-4 font-display text-4xl font-light text-[var(--color-text-primary)] sm:text-5xl">
          Every tile is a person
        </h1>
      </div>
      <WallExplorer initialTiles={tiles} initialTotal={total} />
    </div>
  );
}
