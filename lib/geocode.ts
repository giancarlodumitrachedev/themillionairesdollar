import "server-only";

interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Approximate a city to lat/long via OpenStreetMap Nominatim, then apply a
 * random ±~5km jitter for privacy (PRD §5, geocode-city). Returns null on
 * failure so the caller can store nulls and still create the tile.
 */
export async function geocodeCity(
  country: string,
  city?: string | null
): Promise<LatLng | null> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      limit: "1",
      country,
    });
    if (city) params.set("city", city);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent":
            "TheMillionairesDollar/1.0 (themillionairesdollar.com)",
          "Accept-Language": "en",
        },
        // Avoid caching geocodes at the fetch layer.
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = data[0];
    if (!first) return null;

    return jitter(parseFloat(first.lat), parseFloat(first.lon));
  } catch {
    return null;
  }
}

/** Apply ±~5km random offset (~0.045° at the equator). */
export function jitter(lat: number, lng: number): LatLng {
  const dLat = (Math.random() - 0.5) * 0.09;
  const dLng = (Math.random() - 0.5) * 0.09;
  return {
    latitude: +(lat + dLat).toFixed(5),
    longitude: +(lng + dLng).toFixed(5),
  };
}
