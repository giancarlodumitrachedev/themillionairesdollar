import type { PublicTile } from "./types";

/**
 * Minimal className joiner. We don't pull in clsx/tailwind-merge — the design
 * system is constrained enough that conditional class strings stay simple.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** Extract up to two uppercase initials from a display name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** What to render on a tile, honouring the participant's display_as choice. */
export function tileLabel(tile: Pick<PublicTile, "display_name" | "display_as">): string {
  return tile.display_as === "full_name"
    ? tile.display_name
    : initials(tile.display_name);
}

/** Format a tile number as a zero-padded handle, e.g. 1247 -> "#01247". */
export function formatTileNumber(n: number): string {
  return `#${String(n).padStart(5, "0")}`;
}

/** Group separator formatting for big counters (locale-aware-ish, simple). */
export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Format cents as EUR, e.g. 50000 -> "€500". */
export function formatEur(cents: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

/** ISO 3166-1 alpha-2 -> country name. Falls back to the code. */
export function countryName(code: string): string {
  try {
    return REGION_NAMES.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/** ISO alpha-2 -> flag emoji is intentionally avoided (no emoji policy). */

/** Format an ISO date as "12 January 2026". */
export function formatLongDate(iso: string, locale: string = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Year-only from an ISO date. */
export function yearOf(iso: string): string {
  return String(new Date(iso).getUTCFullYear());
}

/**
 * Deterministic pseudo-random in [0,1) from a string seed. Used for stable
 * mock jitter / animation phases so SSR and client agree (no hydration drift).
 */
export function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // map to [0,1)
  return ((h >>> 0) % 100000) / 100000;
}

/** Clamp helper. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Roman numeral year for the footer (e.g. 2026 -> MMXXVI). */
export function toRoman(num: number): string {
  const map: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [value, symbol] of map) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}

/** Basic email shape validation (the real check is server + Stripe). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
