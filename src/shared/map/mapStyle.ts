/**
 * Map style resolver — the single seam for swapping the map skin.
 *
 * Default: the bundled, hand-tuned Solar Minimalist style (`theme.json`),
 * keyless via OpenFreeMap tiles/glyphs/sprite.
 *
 * Override: set `EXPO_PUBLIC_MAP_STYLE_URL` to a hosted style (e.g. a
 * MapTiler-authored Solar Minimalist style). Nothing else changes — both
 * `VectorMap` renderers consume `resolveMapStyle()`.
 */
import { env } from '../../config/env';
import solarMinimalist from './theme.json';

/** A MapLibre style, accepted as a URL string or an inline style JSON object. */
export type MapStyleInput = string | Record<string, unknown>;

export function resolveMapStyle(): MapStyleInput {
  if (env.MAP_STYLE_URL) {
    return env.MAP_STYLE_URL;
  }
  return solarMinimalist as Record<string, unknown>;
}
