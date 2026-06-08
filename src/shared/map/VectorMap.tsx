import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type * as MapboxTypes from '@rnmapbox/maps';
import { env } from '../../config/env';
import { tokens } from '../theme';
import { Text } from '../components/Text';
import type {
  MapCameraState,
  MapProviderCapabilities,
  MarkerData,
  OfflineTilePackProgress,
  OfflineTilePackRequest,
  Region,
} from './types';

type MapboxModule = typeof MapboxTypes;
type MapboxCameraRef = MapboxTypes.Camera;
type MapState = MapboxTypes.MapState;

const PLACES_SOURCE_ID = 'rahal-places';
const CLUSTER_LAYER_ID = 'rahal-place-clusters';
const CLUSTER_COUNT_LAYER_ID = 'rahal-place-cluster-count';
const MARKER_LAYER_ID = 'rahal-place-markers';
const SELECTED_MARKER_LAYER_ID = 'rahal-place-markers-selected';
const DEFAULT_ZOOM = 12;

export const mapProviderCapabilities: MapProviderCapabilities = {
  name: 'mapbox-vector',
  supportsVectorTiles: true,
  supportsOfflinePacks: true,
  supportsClustering: true,
  requiresCustomDevClient: true,
};

let cachedMapbox: MapboxModule | null | undefined;

function loadMapbox(): MapboxModule | null {
  if (cachedMapbox !== undefined) return cachedMapbox;

  try {
    // Mapbox native code is unavailable in Expo Go. Guard the require so the
    // route can still load and show an explicit fallback instead of crashing.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require('@rnmapbox/maps') as MapboxModule;
    cachedMapbox = loaded;

    if (env.MAPBOX_ACCESS_TOKEN) {
      loaded.default.setAccessToken(env.MAPBOX_ACCESS_TOKEN);
    } else {
      loaded.default.setAccessToken(null);
    }

    loaded.default.setTelemetryEnabled(false);
  } catch {
    cachedMapbox = null;
  }

  return cachedMapbox;
}

interface VectorMapProps {
  region: Region;
  markers: MarkerData[];
  selectedMarkerId?: string | null;
  onMarkerPress?: (marker: MarkerData) => void;
  onCameraSettled?: (state: MapCameraState) => void;
  onPress?: (coordinate: { latitude: number; longitude: number }) => void;
}

function stateToCameraState(state: MapState): MapCameraState {
  const [longitude, latitude] = state.properties.center;
  const ne = state.properties.bounds.ne;
  const sw = state.properties.bounds.sw;

  return {
    center: { latitude, longitude },
    zoom: state.properties.zoom,
    bounds: {
      northEast: {
        latitude: ne[1],
        longitude: ne[0],
      },
      southWest: {
        latitude: sw[1],
        longitude: sw[0],
      },
    },
  };
}

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

export function VectorMap({
  region,
  markers,
  selectedMarkerId,
  onMarkerPress,
  onCameraSettled,
  onPress,
}: VectorMapProps) {
  const Mapbox = loadMapbox();
  const cameraRef = useRef<MapboxCameraRef>(null);
  const markerById = useMemo(
    () => new Map(markers.map((marker) => [marker.id, marker])),
    [markers],
  );
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
    cameraRef.current?.setCamera({
      centerCoordinate: [region.longitude, region.latitude],
      zoomLevel: DEFAULT_ZOOM,
      animationDuration: 450,
      animationMode: 'easeTo',
    });
  }, [region.latitude, region.longitude]);

  if (!Mapbox) {
    return <VectorMapUnavailable />;
  }

  const Camera = Mapbox.Camera;
  const CircleLayer = Mapbox.CircleLayer;
  const ShapeSource = Mapbox.ShapeSource;
  const SymbolLayer = Mapbox.SymbolLayer;

  return (
    <Mapbox.default.MapView
      style={StyleSheet.absoluteFill}
      styleURL={env.MAP_STYLE_URL}
      logoEnabled={false}
      compassEnabled={false}
      scaleBarEnabled={false}
      attributionEnabled
      regionDidChangeDebounceTime={450}
      onPress={(feature) => {
        const coordinates = feature.geometry.coordinates;
        onPress?.({ longitude: coordinates[0], latitude: coordinates[1] });
      }}
      onMapIdle={(state) => onCameraSettled?.(stateToCameraState(state))}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [region.longitude, region.latitude],
          zoomLevel: DEFAULT_ZOOM,
        }}
        minZoomLevel={6}
        maxZoomLevel={18}
      />
      <ShapeSource
        id={PLACES_SOURCE_ID}
        shape={shape}
        cluster
        clusterRadius={56}
        clusterMaxZoomLevel={14}
        hitbox={{ width: 52, height: 52 }}
        onPress={(event) => {
          const feature = event.features[0];
          const id = feature?.properties?.id;
          if (typeof id === 'string') {
            const marker = markerById.get(id);
            if (marker) onMarkerPress?.(marker);
          }
        }}
      >
        <CircleLayer
          id={CLUSTER_LAYER_ID}
          filter={['has', 'point_count']}
          style={{
            circleColor: tokens.colors.primary,
            circleRadius: ['step', ['get', 'point_count'], 18, 10, 23, 30, 28],
            circleOpacity: 0.92,
            circleStrokeColor: tokens.colors.surfaceContainerLowest,
            circleStrokeWidth: 2,
          }}
        />
        <SymbolLayer
          id={CLUSTER_COUNT_LAYER_ID}
          filter={['has', 'point_count']}
          style={{
            textField: ['get', 'point_count_abbreviated'],
            textSize: 12,
            textColor: tokens.colors.onPrimary,
            textAllowOverlap: true,
          }}
        />
        <CircleLayer
          id={MARKER_LAYER_ID}
          filter={['!', ['has', 'point_count']]}
          style={{
            circleColor: [
              'case',
              ['==', ['get', 'isVisited'], true],
              tokens.colors.onSurfaceVariant,
              tokens.colors.primary,
            ],
            circleRadius: 10,
            circleOpacity: 0.95,
            circleStrokeColor: tokens.colors.surfaceContainerLowest,
            circleStrokeWidth: 2,
          }}
        />
        <CircleLayer
          id={SELECTED_MARKER_LAYER_ID}
          filter={['==', ['get', 'isSelected'], true]}
          style={{
            circleColor: tokens.colors.primaryContainer,
            circleRadius: 16,
            circleOpacity: 0.38,
            circleStrokeColor: tokens.colors.primary,
            circleStrokeWidth: 1,
          }}
        />
        <SymbolLayer
          id="rahal-place-labels"
          minZoomLevel={13}
          filter={['!', ['has', 'point_count']]}
          style={{
            textField: ['get', 'title'],
            textSize: 11,
            textColor: tokens.colors.onSurface,
            textHaloColor: tokens.colors.surfaceContainerLowest,
            textHaloWidth: 1,
            textOffset: [0, 1.7],
            textOptional: true,
          }}
        />
      </ShapeSource>
    </Mapbox.default.MapView>
  );
}

export async function preloadOfflineTilePack(
  request: OfflineTilePackRequest,
  onProgress?: (progress: OfflineTilePackProgress) => void,
) {
  const Mapbox = loadMapbox();

  if (!Mapbox) {
    throw new Error('Mapbox native module is not available.');
  }

  await Mapbox.default.offlineManager.createPack(
    {
      name: request.name,
      styleURL: env.MAP_STYLE_URL,
      minZoom: request.minZoom,
      maxZoom: request.maxZoom,
      bounds: [
        [request.bounds.northEast.longitude, request.bounds.northEast.latitude],
        [request.bounds.southWest.longitude, request.bounds.southWest.latitude],
      ],
    },
    (_pack, status) => {
      onProgress?.({
        name: status.name,
        percentage: status.percentage,
        completedTileCount: status.completedTileCount,
        completedResourceCount: status.completedResourceCount,
        requiredResourceCount: status.requiredResourceCount,
      });
    },
  );
}

export async function clearOfflineTilePack(name: string) {
  const Mapbox = loadMapbox();

  if (!Mapbox) {
    throw new Error('Mapbox native module is not available.');
  }

  const pack = await Mapbox.default.offlineManager.getPack(name);
  if (pack) {
    await Mapbox.default.offlineManager.deletePack(name);
  }
}

export function VectorMapUnavailable() {
  const { t } = useTranslation('places');

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="items-center justify-center bg-surface px-[24px]"
    >
      <View className="rounded-xl bg-surface-container-lowest px-[18px] py-[16px]">
        <Text variant="bodyLarge" className="text-on-surface font-bold text-center">
          {t('map.providerUnavailable')}
        </Text>
        <Text variant="bodyMedium" className="mt-[6px] text-on-surface-variant text-center">
          {t('map.providerUnavailableHint')}
        </Text>
      </View>
    </View>
  );
}
