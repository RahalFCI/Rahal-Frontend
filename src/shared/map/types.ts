export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapBounds {
  northEast: {
    latitude: number;
    longitude: number;
  };
  southWest: {
    latitude: number;
    longitude: number;
  };
}

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  isVisited?: boolean;
  isSelected?: boolean;
  updatedAt?: string | null;
}

export interface MapCameraState {
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  bounds: MapBounds;
}

export interface OfflineTilePackRequest {
  name: string;
  bounds: MapBounds;
  minZoom: number;
  maxZoom: number;
}

export interface OfflineTilePackProgress {
  name: string;
  percentage: number;
  completedTileCount: number;
  completedResourceCount: number;
  requiredResourceCount: number;
}

export interface MapProviderCapabilities {
  name: 'mapbox-vector' | 'maplibre-web';
  supportsVectorTiles: boolean;
  supportsOfflinePacks: boolean;
  supportsClustering: boolean;
  requiresCustomDevClient: boolean;
}
