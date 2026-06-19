/**
 * Provider-agnostic map types. The concrete renderer (MapLibre native / web)
 * lives behind `VectorMap`; screens import only from this abstraction so the
 * provider can be swapped without touching feature code (CLAUDE.md §2.5).
 */

/** A geographic point. */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Initial / target camera framing. */
export interface Region extends Coordinates {
  /** MapLibre zoom level (≈ 0 world … 20 building). */
  zoom: number;
}

/** Emitted when the camera settles after a pan/zoom. */
export interface MapCameraState {
  center: Coordinates;
  zoom: number;
}

/**
 * A point rendered on the map. Places supply these today (they carry
 * coordinates); vendor-operated places join once `Place.VendorId` ships
 * (docs/backend-vendor-place-proposal.md).
 */
export interface MarkerData extends Coordinates {
  id: string;
  title?: string;
  categoryId?: string;
  categoryName?: string;
  isVisited?: boolean;
}

/** Capabilities of the active map provider. */
export interface MapProviderCapabilities {
  name: 'maplibre-native' | 'maplibre-web';
  supportsVectorTiles: boolean;
  supportsOfflinePacks: boolean;
  supportsClustering: boolean;
}
