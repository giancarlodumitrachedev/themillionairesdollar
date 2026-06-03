import { Hero } from "@/components/home/hero";
import { Question } from "@/components/home/question";
import { WallPreview } from "@/components/home/wall-preview";
import { MapPreview } from "@/components/home/map-preview";
import { Tiers } from "@/components/home/tiers";
import { Curators } from "@/components/home/curators";
import { Press } from "@/components/home/press";
import { Faq } from "@/components/home/faq";
import { Footer } from "@/components/home/footer";
import {
  getMapPoints,
  getPressCoverage,
  getTierOverrides,
  getTiles,
  getTotalCount,
  getTotalRevenueCents,
} from "@/lib/data";

// Revalidate periodically; realtime handles live counter increments.
export const revalidate = 60;

export default async function HomePage() {
  const [total, tiles, mapPoints, revenue, press, overrides] = await Promise.all([
    getTotalCount(),
    getTiles(50),
    getMapPoints(2000),
    getTotalRevenueCents(),
    getPressCoverage(),
    getTierOverrides(),
  ]);

  return (
    <>
      <Hero initialCount={total} />
      <Question />
      <WallPreview tiles={tiles} total={total} />
      <MapPreview points={mapPoints} total={total} />
      <Tiers revenueCents={revenue} overrides={overrides} />
      <Curators />
      {press.length > 0 && <Press coverage={press} />}
      <Faq />
      <Footer />
    </>
  );
}
