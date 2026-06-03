import type { MetadataRoute } from "next";
import { getTiles } from "@/lib/data";

const SITE = process.env.NEXT_PUBLIC_URL ?? "https://themillionairesdollar.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/wall",
    "/map",
    "/manifesto",
    "/press",
    "/participate",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Include recent tiles (capped to keep the sitemap lean).
  let tileRoutes: MetadataRoute.Sitemap = [];
  try {
    const tiles = await getTiles(1000);
    tileRoutes = tiles.map((t) => ({
      url: `${SITE}/tile/${t.id}`,
      lastModified: new Date(t.created_at),
      changeFrequency: "monthly",
      priority: 0.4,
    }));
  } catch {
    /* ignore */
  }

  return [...staticRoutes, ...tileRoutes];
}
