import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  UserLocation,
  type CameraRef,
  type StyleSpecification,
} from '@maplibre/maplibre-react-native';
import { LocateFixed } from 'lucide-react-native';
import { Icon } from '../components';
import { useTheme } from '../theme';
import { EGYPT_BOUNDS, EGYPT_MIN_ZOOM, egyptBoundary, egyptMask } from './egypt';
import { buildFogCollection, FOG_BAND_OPACITY } from './fog';
import { clusterMarkers, CLUSTER_MAX_ZOOM, type MapCluster } from './clustering';
import { ClusterMarker, RelicMarker } from './MapPins';
import { resolveMapStyle } from './mapStyle';
import { useUserLocation } from './useUserLocation';
import type { Coordinates, MapCameraState, MapProviderCapabilities, MarkerData, Region } from './types';

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
  /** Paint the fog-of-war veil, cleared around visited markers. Default true. */
  fogEnabled?: boolean;
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
  fogEnabled = true,
}: VectorMapProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  // A marker tap and the map's background tap can both fire for one touch;
  // this timestamp lets the background handler ignore the trailing event so a
  // marker selection isn't immediately cleared.
  const lastFeaturePressRef = useRef(0);
  // Current zoom drives client-side clustering (custom view-pins don't use the
  // native cluster source). Seeded from the initial region, then tracked live.
  const [zoom, setZoom] = useState(region.zoom);
  const { permission, isLocating, locate } = useUserLocation();

  useEffect(() => {
    cameraRef.current?.setStop({
      center: [region.longitude, region.latitude],
      zoom: region.zoom,
      easing: 'ease',
      duration: 450,
    });
  }, [region.latitude, region.longitude, region.zoom]);

  // The fog veil clears around visited markers; recomputed only when the set of
  // discovered places changes, not on every pan/zoom.
  const fogCollection = useMemo<GeoJSON.FeatureCollection>(() => {
    const reveals: Coordinates[] = markers
      .filter((marker) => marker.isVisited)
      .map((marker) => ({ latitude: marker.latitude, longitude: marker.longitude }));
    return buildFogCollection(reveals);
  }, [markers]);

  // Group markers into solo pins / count bubbles for the current zoom.
  const clusters = useMemo<MapCluster[]>(() => clusterMarkers(markers, zoom), [markers, zoom]);

  function handleClusterPress(cluster: Extract<MapCluster, { kind: 'cluster' }>) {
    lastFeaturePressRef.current = Date.now();
    cameraRef.current?.setStop({
      center: [cluster.longitude, cluster.latitude],
      zoom: Math.min(Math.max(zoom + 2.5, CLUSTER_MAX_ZOOM), 16),
      easing: 'ease',
      duration: 450,
    });
  }

  function handleRelicPress(id: string) {
    lastFeaturePressRef.current = Date.now();
    onMarkerPress?.(id);
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
          const { center, zoom: nextZoom } = event.nativeEvent;
          setZoom(nextZoom);
          onCameraSettled?.({
            center: { latitude: center[1], longitude: center[0] },
            zoom: nextZoom,
          });
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [region.longitude, region.latitude],
            zoom: region.zoom,
          }}
          minZoom={EGYPT_MIN_ZOOM}
          maxZoom={18}
          maxBounds={[EGYPT_BOUNDS.sw[0], EGYPT_BOUNDS.sw[1], EGYPT_BOUNDS.ne[0], EGYPT_BOUNDS.ne[1]]}
        />

        {/* "Coming soon" treatment: dim everything outside Egypt and outline it. */}
        <GeoJSONSource id="egypt-mask" data={egyptMask}>
          <Layer
            id="egypt-mask-fill"
            type="fill"
            paint={{ 'fill-color': theme.colors.onSurface, 'fill-opacity': 0.4 }}
          />
        </GeoJSONSource>
        <GeoJSONSource id="egypt-boundary" data={egyptBoundary}>
          <Layer
            id="egypt-boundary-line"
            type="line"
            paint={{
              'line-color': theme.colors.primary,
              'line-width': 1.5,
              'line-opacity': 0.5,
            }}
          />
        </GeoJSONSource>

        {/* Fog of war: a pale "unexplored" veil over Egypt, feathered into soft
            windows around visited markers via stacked equal-opacity bands. */}
        {fogEnabled ? (
          <GeoJSONSource id="fog" data={fogCollection}>
            {[0, 1, 2].map((band) => (
              <Layer
                key={`fog-${band}`}
                id={`fog-band-${band}`}
                type="fill"
                filter={['==', ['get', 'band'], band]}
                paint={{ 'fill-color': theme.colors.surface, 'fill-opacity': FOG_BAND_OPACITY }}
              />
            ))}
          </GeoJSONSource>
        ) : null}

        {showUserLocation && permission === 'granted' ? <UserLocation animated /> : null}

        {clusters.map((cluster) =>
          cluster.kind === 'cluster' ? (
            <ClusterMarker key={cluster.id} cluster={cluster} onPress={handleClusterPress} />
          ) : (
            <RelicMarker
              key={cluster.id}
              marker={cluster.marker}
              selected={selectedId === cluster.id}
              onPress={handleRelicPress}
            />
          ),
        )}
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
