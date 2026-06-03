"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { PublicTile } from "@/lib/types";
import { DESIGN, MAP_DEFAULTS, MAPBOX_TOKEN, darkStyle } from "@/lib/mapbox";
import { countryName, formatTileNumber, tileLabel } from "@/lib/utils";

interface WorldMapProps {
  points: PublicTile[];
  /** Compact controls for the full-screen /map page. */
  compact?: boolean;
  className?: string;
}

function toGeoJSON(points: PublicTile[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude!, p.latitude!],
        },
        properties: {
          id: p.id,
          tile_number: p.tile_number,
          label: tileLabel(p),
          country: countryName(p.country_code),
          year: p.year_became_millionaire ?? "",
        },
      })),
  };
}

export function WorldMap({ points, compact, className }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) return; // Fallback handled by parent.

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: darkStyle(),
      center: MAP_DEFAULTS.center,
      zoom: MAP_DEFAULTS.zoom,
      minZoom: MAP_DEFAULTS.minZoom,
      maxZoom: MAP_DEFAULTS.maxZoom,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      projection: { name: "mercator" },
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      map.addSource("participants", {
        type: "geojson",
        data: toGeoJSON(points),
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 44,
      });

      // Clusters
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "participants",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": DESIGN.land,
          "circle-stroke-color": DESIGN.point,
          "circle-stroke-width": 1,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            12,
            25,
            16,
            100,
            22,
          ],
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "participants",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": 11,
        },
        paint: { "text-color": DESIGN.pointBright },
      });

      // Glow (soft halo)
      map.addLayer({
        id: "point-glow",
        type: "circle",
        source: "participants",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": DESIGN.point,
          "circle-radius": 8,
          "circle-blur": 1,
          "circle-opacity": 0.4,
        },
      });

      // Core point
      map.addLayer({
        id: "point",
        type: "circle",
        source: "participants",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": DESIGN.point,
          "circle-radius": compact ? 3.5 : 3,
          "circle-opacity": 0.9,
        },
      });

      setReady(true);

      // Gentle global pulse on the glow layer.
      if (!reduceMotion) {
        let t = 0;
        const animate = () => {
          t += 0.016;
          const op = 0.3 + 0.15 * (0.5 + 0.5 * Math.sin(t));
          if (map.getLayer("point-glow")) {
            map.setPaintProperty("point-glow", "circle-opacity", op);
          }
          if (mapRef.current) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }

      // Cursor + popups for individual points.
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true,
        offset: 12,
        className: "md-map-popup",
      });

      map.on("mouseenter", "point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "point", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      map.on("click", "point", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const props = f.properties as Record<string, string>;
        const coords = (f.geometry as GeoJSON.Point).coordinates.slice() as [
          number,
          number,
        ];
        popup
          .setLngLat(coords)
          .setHTML(
            `<div class="md-popup">
               <span class="md-popup-num">${formatTileNumber(Number(props.tile_number))}</span>
               <span class="md-popup-name">${props.label}</span>
               <span class="md-popup-meta">${props.country}${props.year ? " · " + props.year : ""}</span>
             </div>`
          )
          .addTo(map);
      });

      // Zoom into clusters on click.
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const src = map.getSource("participants") as mapboxgl.GeoJSONSource;
        if (clusterId == null) return;
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const coords = (features[0]!.geometry as GeoJSON.Point).coordinates as [
            number,
            number,
          ];
          map.easeTo({ center: coords, zoom });
        });
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when points change (e.g. realtime additions).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource("participants") as mapboxgl.GeoJSONSource | undefined;
    src?.setData(toGeoJSON(points));
  }, [points, ready]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
      aria-label="World map of participants"
      role="img"
    />
  );
}
