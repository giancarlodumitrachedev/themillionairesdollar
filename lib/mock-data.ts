import type { PublicTile, Tier } from "./types";
import { seededRandom } from "./utils";

/** A small atlas of cities with coordinates, used to scatter mock tiles. */
const CITIES: Array<{ city: string; country: string; lat: number; lng: number }> = [
  { city: "Milano", country: "IT", lat: 45.4642, lng: 9.19 },
  { city: "Roma", country: "IT", lat: 41.9028, lng: 12.4964 },
  { city: "London", country: "GB", lat: 51.5074, lng: -0.1278 },
  { city: "New York", country: "US", lat: 40.7128, lng: -74.006 },
  { city: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194 },
  { city: "Paris", country: "FR", lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "DE", lat: 52.52, lng: 13.405 },
  { city: "Zürich", country: "CH", lat: 47.3769, lng: 8.5417 },
  { city: "Dubai", country: "AE", lat: 25.2048, lng: 55.2708 },
  { city: "Singapore", country: "SG", lat: 1.3521, lng: 103.8198 },
  { city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503 },
  { city: "Hong Kong", country: "HK", lat: 22.3193, lng: 114.1694 },
  { city: "Mumbai", country: "IN", lat: 19.076, lng: 72.8777 },
  { city: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333 },
  { city: "Toronto", country: "CA", lat: 43.6532, lng: -79.3832 },
  { city: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093 },
  { city: "Amsterdam", country: "NL", lat: 52.3676, lng: 4.9041 },
  { city: "Stockholm", country: "SE", lat: 59.3293, lng: 18.0686 },
  { city: "Madrid", country: "ES", lat: 40.4168, lng: -3.7038 },
  { city: "Lisboa", country: "PT", lat: 38.7223, lng: -9.1393 },
];

const NAMES: string[] = [
  "Alessandro Bianchi", "Marco Rossi", "Giulia Ferrari", "Sofia Romano",
  "James Whitfield", "Eleanor Hart", "Oliver Pierce", "Amara Okafor",
  "Liang Wei", "Yuki Tanaka", "Rajesh Kapoor", "Priya Nair",
  "Lucas Almeida", "Camila Souza", "Henrik Larsson", "Astrid Berg",
  "Mathilde Laurent", "Théo Moreau", "Felix Wagner", "Lena Schmidt",
  "Noah Visser", "Emma de Vries", "Diego Fernández", "Carmen Ruiz",
  "Khalid Al-Rashid", "Layla Hassan", "Connor Walsh", "Maeve Byrne",
  "Anton Petrov", "Natalia Ivanova", "Ji-ho Park", "Seo-yeon Kim",
];

const MESSAGES: string[] = [
  "I was here.",
  "Built it from nothing.",
  "For my mother.",
  "Still curious after all this.",
  "Quietly, then all at once.",
  "Proof, for whoever asks.",
  "I exist. That is enough.",
  "Counted, at last.",
  "",
  "",
];

function pickTier(seed: number): Tier {
  if (seed < 0.84) return "existence";
  if (seed < 0.95) return "verified";
  if (seed < 0.985) return "founding";
  if (seed < 0.996) return "permanent";
  return "patron";
}

/**
 * Deterministically generate `count` mock public tiles. Stable across SSR and
 * client so there is no hydration mismatch.
 */
export function generateMockTiles(count: number): PublicTile[] {
  const tiles: PublicTile[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(`tile-${i}-a`);
    const r2 = seededRandom(`tile-${i}-b`);
    const r3 = seededRandom(`tile-${i}-c`);
    const r4 = seededRandom(`tile-${i}-d`);

    const place = CITIES[Math.floor(r1 * CITIES.length)]!;
    const name = NAMES[Math.floor(r2 * NAMES.length)]!;
    const tier = pickTier(seededRandom(`tile-${i}-tier`));

    // ±5km jitter (~0.045°) for privacy, deterministic per tile.
    const jitterLat = (r3 - 0.5) * 0.09;
    const jitterLng = (r4 - 0.5) * 0.09;

    const message = MESSAGES[Math.floor(seededRandom(`tile-${i}-msg`) * MESSAGES.length)]!;
    const year = 1985 + Math.floor(seededRandom(`tile-${i}-yr`) * 40);

    // Spread creation times over the last ~60 days.
    const createdAt = new Date(
      now - Math.floor(seededRandom(`tile-${i}-t`) * 60 * 24 * 3600 * 1000)
    ).toISOString();

    tiles.push({
      id: `mock-${String(i + 1).padStart(6, "0")}`,
      tile_number: i + 1,
      tier,
      display_name: name,
      display_as: seededRandom(`tile-${i}-da`) < 0.55 ? "initials" : "full_name",
      country_code: place.country,
      city: place.city,
      latitude: +(place.lat + jitterLat).toFixed(5),
      longitude: +(place.lng + jitterLng).toFixed(5),
      year_became_millionaire: seededRandom(`tile-${i}-hy`) < 0.7 ? year : null,
      personal_message: message || null,
      created_at: createdAt,
    });
  }

  // Newest first.
  return tiles.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/** A headline number used when the live DB isn't wired up yet. */
export const MOCK_TOTAL = 14847;
