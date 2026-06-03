import type { Metadata } from "next";
import { MapFull } from "@/components/map/map-full";
import { getMapPoints, getTotalCount } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Map",
  description: "Where existence has been declared, in real time.",
};

export const revalidate = 60;

export default async function MapPage() {
  const [points, total] = await Promise.all([
    getMapPoints(5000),
    getTotalCount(),
  ]);

  return <MapFull points={points} total={total} />;
}
