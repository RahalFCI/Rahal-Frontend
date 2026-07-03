/**
 * Egypt focus region — the app launches in Egypt only; the rest of the world is
 * presented as a dimmed "coming soon" mask and is locked off from panning.
 *
 * Two mechanisms work together:
 *  1. `EGYPT_BOUNDS` / `EGYPT_MIN_ZOOM` constrain the camera so the viewport can
 *     never leave Egypt (passed to the MapLibre Camera `maxBounds` / `minZoom`).
 *  2. `egyptMask` paints a translucent scrim over everything *outside* a
 *     simplified Egypt outline (a world polygon with Egypt cut out as a hole),
 *     so neighbouring countries read as locked. `egyptBoundary` traces the
 *     outline so the active region keeps a crisp edge.
 *
 * The outline is intentionally simplified (~20 vertices) — it only needs to look
 * right under a dim veil, not survey-grade borders.
 */

/** SW / NE corners as [lng, lat], padded slightly beyond the land borders. */
export const EGYPT_BOUNDS = {
  sw: [24.0, 21.5] as [number, number],
  ne: [37.4, 32.2] as [number, number],
};

/** Floor zoom so the camera can't pull back to reveal the whole region. */
export const EGYPT_MIN_ZOOM = 5;

/** Simplified Egypt outline, [lng, lat], traced clockwise from the NW coast. */
export const EGYPT_RING: GeoJSON.Position[] = [
  [24.7, 31.6], // Sallum — NW Mediterranean coast
  [27.0, 31.4],
  [28.5, 30.9],
  [29.9, 31.2], // Alexandria
  [30.9, 31.5], // Rosetta
  [31.8, 31.5], // Damietta (Delta)
  [32.3, 31.25], // Port Said
  [33.7, 31.1], // North Sinai coast
  [34.25, 31.22], // Rafah
  [34.9, 29.5], // Taba (Gulf of Aqaba)
  [34.3, 27.85], // Sharm el-Sheikh (S Sinai)
  [33.0, 28.9], // up the W Sinai shore
  [32.55, 29.97], // Suez
  [32.35, 29.6], // mainland Red Sea coast
  [33.8, 27.25], // Hurghada
  [34.9, 25.07], // Marsa Alam
  [36.0, 23.0],
  [36.9, 22.0], // SE corner (Sudan border / Red Sea)
  [24.7, 22.0], // SW corner (22°N parallel)
  [24.7, 31.6], // close along the 25°E meridian
];

/** Whole-world rectangle, wound CCW so the Egypt ring reads as an interior hole. */
const WORLD_RING: GeoJSON.Position[] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/** Polygon covering the world with Egypt removed — the basis for the dim scrim. */
export const egyptMask: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [WORLD_RING, EGYPT_RING],
  },
};

/** The Egypt outline on its own, for a crisp active-region edge. */
export const egyptBoundary: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: EGYPT_RING,
  },
};
