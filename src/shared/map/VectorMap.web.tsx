import { useEffect, useMemo, useRef } from 'react';
import maplibregl, {
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type StyleSpecification,
} from 'maplibre-gl';
import { env } from '../../config/env';
import { tokens } from '../theme';
import type {
  MapCameraState,
  MapProviderCapabilities,
  MarkerData,
  OfflineTilePackProgress,
  OfflineTilePackRequest,
  Region,
} from './types';

const PLACES_SOURCE_ID = 'rahal-places';
const CLUSTER_LAYER_ID = 'rahal-place-clusters';
const CLUSTER_COUNT_LAYER_ID = 'rahal-place-cluster-count';
const MARKER_LAYER_ID = 'rahal-place-markers';
const SELECTED_MARKER_LAYER_ID = 'rahal-place-markers-selected';
const LABEL_LAYER_ID = 'rahal-place-labels';
const DEFAULT_ZOOM = 12;

export const mapProviderCapabilities: MapProviderCapabilities = {
  name: 'maplibre-web',
  supportsVectorTiles: true,
  supportsOfflinePacks: false,
  supportsClustering: true,
  requiresCustomDevClient: false,
};

interface VectorMapProps {
  region: Region;
  markers: MarkerData[];
  selectedMarkerId?: string | null;
  onMarkerPress?: (marker: MarkerData) => void;
  onCameraSettled?: (state: MapCameraState) => void;
  onPress?: (coordinate: { latitude: number; longitude: number }) => void;
}

const fallbackStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

function markersToFeatureCollection(markers: MarkerData[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      id: marker.id,
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude],
      },
      properties: {
        id: marker.id,
        title: marker.title ?? '',
        categoryName: marker.categoryName ?? '',
        isVisited: marker.isVisited ?? false,
        isSelected: marker.isSelected ?? false,
      },
    })),
  };
}

function cameraStateFromMap(map: maplibregl.Map): MapCameraState {
  const center = map.getCenter();
  const bounds = map.getBounds();

  return {
    center: {
      latitude: center.lat,
      longitude: center.lng,
    },
    zoom: map.getZoom(),
    bounds: {
      northEast: {
        latitude: bounds.getNorthEast().lat,
        longitude: bounds.getNorthEast().lng,
      },
      southWest: {
        latitude: bounds.getSouthWest().lat,
        longitude: bounds.getSouthWest().lng,
      },
    },
  };
}

function addPlaceLayers(map: maplibregl.Map, shape: GeoJSON.FeatureCollection<GeoJSON.Point>) {
  if (map.getSource(PLACES_SOURCE_ID)) return;

  map.addSource(PLACES_SOURCE_ID, {
    type: 'geojson',
    data: shape,
    cluster: true,
    clusterRadius: 56,
    clusterMaxZoom: 14,
  });

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: PLACES_SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': tokens.colors.primary,
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 23, 30, 28],
      'circle-opacity': 0.92,
      'circle-stroke-color': tokens.colors.surfaceContainerLowest,
      'circle-stroke-width': 2,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: PLACES_SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': tokens.colors.onPrimary,
    },
  });

  map.addLayer({
    id: SELECTED_MARKER_LAYER_ID,
    type: 'circle',
    source: PLACES_SOURCE_ID,
    filter: ['==', ['get', 'isSelected'], true],
    paint: {
      'circle-color': tokens.colors.primaryContainer,
      'circle-radius': 16,
      'circle-opacity': 0.38,
      'circle-stroke-color': tokens.colors.primary,
      'circle-stroke-width': 1,
    },
  });

  map.addLayer({
    id: MARKER_LAYER_ID,
    type: 'circle',
    source: PLACES_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'isVisited'], true],
        tokens.colors.onSurfaceVariant,
        tokens.colors.primary,
      ],
      'circle-radius': 10,
      'circle-opacity': 0.95,
      'circle-stroke-color': tokens.colors.surfaceContainerLowest,
      'circle-stroke-width': 2,
    },
  });

  map.addLayer({
    id: LABEL_LAYER_ID,
    type: 'symbol',
    source: PLACES_SOURCE_ID,
    minzoom: 13,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'title'],
      'text-size': 11,
      'text-offset': [0, 1.7],
      'text-optional': true,
    },
    paint: {
      'text-color': tokens.colors.onSurface,
      'text-halo-color': tokens.colors.surfaceContainerLowest,
      'text-halo-width': 1,
    },
  });
}

export function VectorMap({
  region,
  markers,
  selectedMarkerId,
  onMarkerPress,
  onCameraSettled,
  onPress,
}: VectorMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerByIdRef = useRef(new Map<string, MarkerData>());
  const onCameraSettledRef = useRef(onCameraSettled);
  const onMarkerPressRef = useRef(onMarkerPress);
  const onPressRef = useRef(onPress);
  const shape = useMemo(
    () =>
      markersToFeatureCollection(
        markers.map((marker) => ({
          ...marker,
          isSelected: marker.id === selectedMarkerId,
        })),
      ),
    [markers, selectedMarkerId],
  );

  useEffect(() => {
    markerByIdRef.current = new Map(markers.map((marker) => [marker.id, marker]));
  }, [markers]);

  useEffect(() => {
    onCameraSettledRef.current = onCameraSettled;
    onMarkerPressRef.current = onMarkerPress;
    onPressRef.current = onPress;
  }, [onCameraSettled, onMarkerPress, onPress]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: env.MAP_STYLE_URL || fallbackStyle,
      center: [region.longitude, region.latitude],
      zoom: DEFAULT_ZOOM,
      attributionControl: {
        compact: true,
      },
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      addPlaceLayers(map, shape);
    });

    map.on('moveend', () => onCameraSettledRef.current?.(cameraStateFromMap(map)));

    map.on('click', MARKER_LAYER_ID, (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === 'string') {
        const marker = markerByIdRef.current.get(id);
        if (marker) onMarkerPressRef.current?.(marker);
      }
    });

    map.on('click', CLUSTER_LAYER_ID, async (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      const coordinates = feature?.geometry.type === 'Point' ? feature.geometry.coordinates : null;
      const source = map.getSource(PLACES_SOURCE_ID) as GeoJSONSource | undefined;
      if (typeof clusterId === 'number' && coordinates && source) {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: [coordinates[0], coordinates[1]], zoom });
      }
    });

    map.on('click', (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: [MARKER_LAYER_ID, CLUSTER_LAYER_ID],
      });
      if (features.length === 0) {
        onPressRef.current?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
      }
    });

    map.on('mouseenter', MARKER_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', MARKER_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // The MapLibre instance should be created once. Later camera and marker
    // changes are applied through dedicated effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: [region.longitude, region.latitude],
      zoom: DEFAULT_ZOOM,
      duration: 450,
    });
  }, [region.latitude, region.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    const source = map.getSource(PLACES_SOURCE_ID) as GeoJSONSource | undefined;
    if (source) {
      source.setData(shape);
    } else {
      addPlaceLayers(map, shape);
    }
  }, [shape]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: tokens.colors.surfaceContainerLow,
      }}
    />
  );
}

export async function preloadOfflineTilePack(
  _request: OfflineTilePackRequest,
  _onProgress?: (progress: OfflineTilePackProgress) => void,
) {
  throw new Error('Offline tile packs are only supported by the native Mapbox provider.');
}

export async function clearOfflineTilePack(_name: string) {
  throw new Error('Offline tile packs are only supported by the native Mapbox provider.');
}
