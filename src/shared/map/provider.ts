import type { MapProviderCapabilities } from './types';
import { mapProviderCapabilities } from './VectorMap';

export { VectorMap } from './VectorMap';
export { clearOfflineTilePack, mapProviderCapabilities, preloadOfflineTilePack } from './VectorMap';

export const mapProvider: MapProviderCapabilities = mapProviderCapabilities;
