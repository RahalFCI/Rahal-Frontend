import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  UserLocation,
  type CameraRef,
  type GeoJSONSourceRef,
  type PressEventWithFeatures,
  type StyleSpecification,
} from '@maplibre/maplibre-react-native';
import { LocateFixed } from 'lucide-react-native';
import type { NativeSyntheticEvent } from 'react-native';
import { Icon } from '../components';
import { useTheme } from '../theme';
import { resolveMapStyle } from './mapStyle';
import { useUserLocation } from './useUserLocation';
import type { MapCameraState, MapProviderCapabilities, MarkerData, Region } from './types';

export const mapProviderCapabilities: MapProviderCapabilities = {
  name: 'maplibre-native',
  supportsVectorTiles: true,
  supportsOfflinePacks: true,
  supportsClustering: true,
};

interface VectorMapProps {
  region: Region;
  markers?: MarkerData[];
  onPress?: (coordinate: { latitude: number; longitude: number }) => void;
  onCameraSettled?: (state: MapCameraState) => void;
  onMarkerPress?: (id: string) => void;
  /** Id of the currently-selected place; rendered with an emphasized beacon. */
  selectedId?: string | null;
  /** Show the user-location puck + recenter control. Default true. */
  showUserLocation?: boolean;
}

/**
 * MapLibre Native renderer. The skin comes from `resolveMapStyle()` (bundled
 * Solar Minimalist style by default; a hosted URL when configured). Renders
 * clustered place markers, the user-location puck, and a recenter control.
 */
export function VectorMap({
  region,
  markers = [],
  onPress,
  onCameraSettled,
  onMarkerPress,
  selectedId,
  showUserLocation = true,
}: VectorMapProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const sourceRef = useRef<GeoJSONSourceRef>(null);
  // A marker tap and the map's background tap can both fire for one touch;
  // this timestamp lets the background handler ignore the trailing event so a
  // marker selection isn't immediately cleared.
  const lastFeaturePressRef = useRef(0);
  const { permission, isLocating, locate } = useUserLocation();

  useEffect(() => {
    cameraRef.current?.setStop({
      center: [region.longitude, region.latitude],
      zoom: region.zoom,
      easing: 'ease',
      duration: 450,
    });
  }, [region.latitude, region.longitude, region.zoom]);

  const featureCollection = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: markers.map((marker) => ({
        type: 'Feature',
        id: marker.id,
        geometry: { type: 'Point', coordinates: [marker.longitude, marker.latitude] },
        properties: {
          id: marker.id,
          title: marker.title ?? '',
          categoryName: marker.categoryName ?? '',
          isVisited: marker.isVisited ?? false,
        },
      })),
    }),
    [markers],
  );

  async function handleSourcePress(event: NativeSyntheticEvent<PressEventWithFeatures>) {
    const feature = event.nativeEvent.features?.[0];
    if (!feature || feature.geometry.type !== 'Point') return;
    lastFeaturePressRef.current = Date.now();

    const [longitude, latitude] = feature.geometry.coordinates as [number, number];
    const properties = (feature.properties ?? {}) as Record<string, unknown>;

    if (properties.cluster) {
      const clusterId = Number(properties.cluster_id);
      const expansionZoom = await sourceRef.current?.getClusterExpansionZoom(clusterId);
      cameraRef.current?.setStop({
        center: [longitude, latitude],
        zoom: expansionZoom ?? region.zoom + 2,
        easing: 'ease',
        duration: 450,
      });
      return;
    }

    onMarkerPress?.(String(properties.id ?? feature.id ?? ''));
  }

  async function handleRecenter() {
    const coordinates = await locate();
    if (!coordinates) return;
    cameraRef.current?.setStop({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: Math.max(region.zoom, 14),
      easing: 'ease',
      duration: 450,
    });
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={resolveMapStyle() as string | StyleSpecification}
        logo={false}
        compass={false}
        attribution
        onPress={(event) => {
          // Ignore the background tap that trails a marker tap (same touch).
          if (Date.now() - lastFeaturePressRef.current < 300) return;
          const lngLat = (event.nativeEvent as { lngLat?: [number, number] }).lngLat;
          if (lngLat) {
            onPress?.({ latitude: lngLat[1], longitude: lngLat[0] });
          }
        }}
        onRegionDidChange={(event) => {
          const { center, zoom } = event.nativeEvent;
          onCameraSettled?.({
            center: { latitude: center[1], longitude: center[0] },
            zoom,
          });
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [region.longitude, region.latitude],
            zoom: region.zoom,
          }}
          minZoom={4}
          maxZoom={18}
        />

        {showUserLocation && permission === 'granted' ? <UserLocation animated /> : null}

        {markers.length > 0 ? (
          <GeoJSONSource
            ref={sourceRef}
            id="places"
            data={featureCollection}
            cluster
            clusterRadius={50}
            clusterMaxZoom={14}
            onPress={handleSourcePress}
          >
            <Layer
              id="place-cluster-halo"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': theme.colors.primary,
                'circle-opacity': 0.12,
                'circle-radius': ['step', ['get', 'point_count'], 24, 10, 30, 50, 38],
              }}
            />
            <Layer
              id="place-clusters"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': theme.colors.primaryContainer,
                'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 50, 26],
                'circle-stroke-width': 1.5,
                'circle-stroke-color': theme.colors.primary,
              }}
            />
            <Layer
              id="place-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['Noto Sans Regular'],
                'text-size': 13,
              }}
              paint={{ 'text-color': theme.colors.primary }}
            />
            <Layer
              id="place-point-halo"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': theme.colors.primary,
                'circle-opacity': 0.14,
                'circle-radius': 14,
              }}
            />
            <Layer
              id="place-point"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': theme.colors.primary,
                'circle-radius': 6,
                'circle-stroke-width': 2.5,
                'circle-stroke-color': theme.colors.onPrimary,
              }}
            />
            <Layer
              id="place-point-selected"
              type="circle"
              filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'id'], selectedId ?? '']]}
              paint={{
                'circle-color': theme.colors.primary,
                'circle-radius': 10,
                'circle-stroke-width': 3.5,
                'circle-stroke-color': theme.colors.onPrimary,
              }}
            />
          </GeoJSONSource>
        ) : null}
      </Map>

      {showUserLocation ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Center map on my location"
          onPress={handleRecenter}
          disabled={isLocating}
          style={[
            styles.locateButton,
            theme.elevation.ambientShadow,
            {
              // Clear the floating Archivist bar (bottom:16 + ~56 tall + safe area).
              bottom: insets.bottom + 88,
              backgroundColor: theme.colors.surfaceContainerLowest,
              borderColor: theme.colors.outlineVariant,
              opacity: isLocating ? 0.6 : 1,
            },
          ]}
        >
          <Icon icon={LocateFixed} size={22} color={theme.colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  locateButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
