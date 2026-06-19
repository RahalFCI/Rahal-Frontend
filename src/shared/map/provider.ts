/**
 * Map provider barrel. Screens import `VectorMap` and capabilities from here;
 * Metro resolves the platform file (`VectorMap.tsx` native / `VectorMap.web.tsx`).
 */
export { VectorMap, mapProviderCapabilities } from './VectorMap';
export { resolveMapStyle, type MapStyleInput } from './mapStyle';
export { useUserLocation, type UseUserLocation, type LocationPermission } from './useUserLocation';
export type {
  Coordinates,
  Region,
  MapCameraState,
  MarkerData,
  MapProviderCapabilities,
} from './types';
