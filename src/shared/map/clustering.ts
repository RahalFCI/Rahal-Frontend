/**
 * Lightweight client-side clustering for custom view-pins.
 *
 * Native GeoJSON clustering (the `cluster` prop on GeoJSONSource) only applies to
 * vector layers, not to `Marker` view annotations. Since our relic pins are
 * custom React views (see RelicPin), we group them ourselves: a simple uniform
 * grid whose cell size shrinks as you zoom in. Cells holding more than one place
 * collapse into a count bubble; at high zoom every place stands alone.
 *
 * This is intentionally simple (grid, not a k-d tree) — the curated relic set is
 * small, and a grid is cheap to recompute on every camera settle.
 */
import type { MarkerData } from './types';

/** At/above this zoom, clustering is disabled and every place renders solo. */
export const CLUSTER_MAX_ZOOM = 12.5;

/**
 * Grid cell size in degrees at a given zoom. Tuned so dense areas (Cairo/Giza,
 * Luxor) collapse when zoomed out and separate as you zoom toward a city.
 * Halves per zoom level, matching the Web Mercator tile scale.
 */
function cellSizeDeg(zoom: number): number {
  const BASE_DEG_AT_ZOOM_0 = 360;
  return BASE_DEG_AT_ZOOM_0 / 2 ** (zoom + 3);
}

/** A rendered map item: either a single place or a grouped cluster. */
export type MapCluster =
  | { kind: 'point'; id: string; longitude: number; latitude: number; marker: MarkerData }
  | {
      kind: 'cluster';
      id: string;
      longitude: number;
      latitude: number;
      count: number;
      /** True when every grouped place is already discovered. */
      allVisited: boolean;
    };

/**
 * Groups markers into points and clusters for the current zoom. Cluster position
 * is the centroid of its members; a cluster is `allVisited` only when none of its
 * members are still fogged, so a part-explored cluster keeps an undiscovered look.
 */
export function clusterMarkers(markers: MarkerData[], zoom: number): MapCluster[] {
  if (zoom >= CLUSTER_MAX_ZOOM) {
    return markers.map((marker) => ({
      kind: 'point',
      id: marker.id,
      longitude: marker.longitude,
      latitude: marker.latitude,
      marker,
    }));
  }

  const size = cellSizeDeg(zoom);
  const cells = new Map<string, MarkerData[]>();
  for (const marker of markers) {
    const key = `${Math.floor(marker.longitude / size)}:${Math.floor(marker.latitude / size)}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(marker);
    else cells.set(key, [marker]);
  }

  const result: MapCluster[] = [];
  for (const [key, bucket] of cells) {
    if (bucket.length === 1) {
      const marker = bucket[0];
      result.push({
        kind: 'point',
        id: marker.id,
        longitude: marker.longitude,
        latitude: marker.latitude,
        marker,
      });
      continue;
    }
    const sum = bucket.reduce(
      (acc, m) => ({ lng: acc.lng + m.longitude, lat: acc.lat + m.latitude }),
      { lng: 0, lat: 0 },
    );
    result.push({
      kind: 'cluster',
      id: `cluster:${key}`,
      longitude: sum.lng / bucket.length,
      latitude: sum.lat / bucket.length,
      count: bucket.length,
      allVisited: bucket.every((m) => m.isVisited),
    });
  }
  return result;
}
