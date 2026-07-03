/**
 * Fog of war — the exploration veil.
 *
 * All of Egypt starts shrouded under a pale "unexplored" veil; each place the
 * Explorer has checked in at clears a soft window in the fog, revealing the
 * Solar Minimalist basemap beneath. This is the same polygon-with-holes trick
 * as `egyptMask` (a fill whose interior rings punch transparent holes), applied
 * *inside* Egypt and keyed off visited coordinates.
 *
 * A single hard hole would look like a cookie-cutter, so we emit the fog as
 * several concentric bands (one feature per radius). Stacking equal-opacity fill
 * layers — each with progressively larger holes — feathers the edge into a soft
 * gradient without any per-pixel blur (CLAUDE.md §3.4: tonal, not shimmer).
 */
import { EGYPT_RING } from './egypt';
import type { Coordinates } from './types';

/** Reveal-band radii in kilometres, outermost (faintest) first. */
export const FOG_BAND_RADII_KM = [11, 7, 3.8] as const;

/** Per-band fill opacity. Combined at full overlap ≈ 1−(1−a)^n veil strength. */
export const FOG_BAND_OPACITY = 0.3;

/** Degrees of latitude per kilometre (constant); longitude scales by cos(lat). */
const KM_PER_DEG_LAT = 110.574;

/**
 * Approximates a geographic circle as an N-gon ring of [lng, lat] positions.
 * Longitude degrees are compressed by cos(latitude) so the circle stays round
 * rather than squished as you move away from the equator.
 */
function circleRing(center: Coordinates, radiusKm: number, steps = 48): GeoJSON.Position[] {
  const latDelta = radiusKm / KM_PER_DEG_LAT;
  const lngDelta = radiusKm / (KM_PER_DEG_LAT * Math.cos((center.latitude * Math.PI) / 180));
  const ring: GeoJSON.Position[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI;
    ring.push([
      center.longitude + lngDelta * Math.cos(angle),
      center.latitude + latDelta * Math.sin(angle),
    ]);
  }
  return ring;
}

/**
 * Builds the banded fog as a FeatureCollection — one Polygon per radius band,
 * tagged with `band` (0 = outermost). Each polygon is the Egypt outline with a
 * circular hole punched at every reveal. With no reveals the country is a solid
 * veil ("nothing discovered yet"). Render one fill layer per band, all at
 * `FOG_BAND_OPACITY`, filtered by `band`.
 */
export function buildFogCollection(reveals: Coordinates[]): GeoJSON.FeatureCollection {
  const features = FOG_BAND_RADII_KM.map((radiusKm, band) => {
    const holes = reveals.map((reveal) => circleRing(reveal, radiusKm));
    return {
      type: 'Feature' as const,
      properties: { band },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [EGYPT_RING, ...holes],
      },
    };
  });

  return { type: 'FeatureCollection', features };
}
