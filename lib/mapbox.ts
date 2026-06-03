/**
 * Mapbox configuration + the custom dark "Natural Earth" style described in the
 * PRD (§3.4). We don't rely on a hosted Studio style so the look is fully
 * version-controlled and free of city/road/POI labels.
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const DESIGN = {
  water: "#0a0a0a",
  land: "#1a1a1a",
  border: "#2a2a2a",
  label: "#6b6862",
  point: "#8b7355",
  pointBright: "#c9a876",
} as const;

export const MAP_DEFAULTS = {
  center: [10, 30] as [number, number],
  zoom: 1.3,
  minZoom: 0.6,
  maxZoom: 10,
};

/**
 * A self-contained Mapbox GL style JSON. Uses the open Mapbox "countries"
 * vector source via the Streets v8 tileset for boundaries only, styled dark.
 * Exported so it can also be written to public/mapbox-style.json (deliverable).
 */
export function darkStyle(): mapboxgl.Style {
  return {
    version: 8,
    name: "Millionaire's Dollar — Dark",
    sources: {
      composite: {
        type: "vector",
        url: "mapbox://mapbox.mapbox-streets-v8",
      },
    },
    sprite: "mapbox://sprites/mapbox/dark-v11",
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": DESIGN.water },
      },
      {
        id: "land",
        type: "fill",
        source: "composite",
        "source-layer": "landuse",
        paint: { "fill-color": DESIGN.land },
      },
      {
        id: "admin-boundaries",
        type: "line",
        source: "composite",
        "source-layer": "admin",
        filter: ["==", ["get", "admin_level"], 0],
        paint: {
          "line-color": DESIGN.border,
          "line-width": 0.5,
        },
      },
      {
        id: "country-labels",
        type: "symbol",
        source: "composite",
        "source-layer": "place_label",
        minzoom: 3.5,
        filter: ["==", ["get", "type"], "country"],
        layout: {
          "text-field": ["get", "name_en"],
          "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
          "text-size": 10,
          "text-letter-spacing": 0.1,
        },
        paint: {
          "text-color": DESIGN.label,
          "text-halo-color": DESIGN.water,
          "text-halo-width": 1,
        },
      },
    ],
  } as unknown as mapboxgl.Style;
}
