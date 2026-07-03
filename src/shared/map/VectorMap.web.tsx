import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import maplibregl from 'maplibre-gl';
import { useTheme } from '../theme';
import { EGYPT_BOUNDS, EGYPT_MIN_ZOOM, egyptBoundary, egyptMask } from './egypt';
import { buildFogCollection, FOG_BAND_OPACITY } from './fog';
import { resolveMapStyle } from './mapStyle';
import type { Coordinates, MapCameraState, MapProviderCapabilities, MarkerData, Region } from './types';

export const mapProviderCapabilities: MapProviderCapabilities = {
  name: 'maplibre-web',
  supportsVectorTiles: true,
  supportsOfflinePacks: false,
  supportsClustering: false,
};

interface VectorMapProps {
  region: Region;
  markers?: MarkerData[];
  onPress?: (coordinate: { latitude: number; longitude: number }) => void;
  onCameraSettled?: (state: MapCameraState) => void;
  onMarkerPress?: (id: string) => void;
  selectedId?: string | null;
  showUserLocation?: boolean;
  fogEnabled?: boolean;
}

/** Reveal coordinates from the visited subset of markers. */
function revealsOf(markers: MarkerData[]): Coordinates[] {
  return markers
    .filter((marker) => marker.isVisited)
    .map((marker) => ({ latitude: marker.latitude, longitude: marker.longitude }));
}

/**
 * MapLibre GL JS renderer for web (react-native-web). Mirrors the native
 * `VectorMap` API. Markers render as DOM pins (no clustering on web);
 * user location uses the built-in GeolocateControl.
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: resolveMapStyle() as string | maplibregl.StyleSpecification,
      center: [region.longitude, region.latitude],
      zoom: region.zoom,
      minZoom: EGYPT_MIN_ZOOM,
      maxBounds: [EGYPT_BOUNDS.sw, EGYPT_BOUNDS.ne],
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    // "Coming soon" treatment: dim everything outside Egypt and outline it.
    map.on('load', () => {
      map.addSource('egypt-mask', { type: 'geojson', data: egyptMask });
      map.addLayer({
        id: 'egypt-mask-fill',
        type: 'fill',
        source: 'egypt-mask',
        paint: { 'fill-color': theme.colors.onSurface, 'fill-opacity': 0.4 },
      });
      map.addSource('egypt-boundary', { type: 'geojson', data: egyptBoundary });
      map.addLayer({
        id: 'egypt-boundary-line',
        type: 'line',
        source: 'egypt-boundary',
        paint: { 'line-color': theme.colors.primary, 'line-width': 1.5, 'line-opacity': 0.5 },
      });

      // Fog of war: pale veil over Egypt, feathered around visited markers.
      if (fogEnabled) {
        map.addSource('fog', { type: 'geojson', data: buildFogCollection(revealsOf(markers)) });
        [0, 1, 2].forEach((band) => {
          map.addLayer({
            id: `fog-band-${band}`,
            type: 'fill',
            source: 'fog',
            filter: ['==', ['get', 'band'], band],
            paint: { 'fill-color': theme.colors.surface, 'fill-opacity': FOG_BAND_OPACITY },
          });
        });
      }

      loadedRef.current = true;
    });

    if (showUserLocation) {
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
      );
    }

    map.on('click', (event) => {
      onPress?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
    });
    map.on('moveend', () => {
      const center = map.getCenter();
      onCameraSettled?.({
        center: { latitude: center.lat, longitude: center.lng },
        zoom: map.getZoom(),
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Initialize once; camera + markers handled in the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.easeTo({
      center: [region.longitude, region.latitude],
      zoom: region.zoom,
      duration: 450,
    });
  }, [region.latitude, region.longitude, region.zoom]);

  // Keep the fog reveals in sync as discovery state changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current || !fogEnabled) return;
    const source = map.getSource('fog') as maplibregl.GeoJSONSource | undefined;
    source?.setData(buildFogCollection(revealsOf(markers)));
  }, [markers, fogEnabled]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = markers.map((marker) => {
      const visited = !!marker.isVisited;
      const selected = marker.id === selectedId;
      const size = selected ? 22 : visited ? 18 : 14;
      const element = document.createElement('div');
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.borderRadius = '50%';
      element.style.cursor = 'pointer';
      element.style.boxSizing = 'border-box';
      // Discovered = amber beacon; undiscovered = pale dashed ghost.
      element.style.backgroundColor = visited ? theme.colors.primary : theme.colors.surfaceContainerLowest;
      element.style.border = visited
        ? `2.5px solid ${theme.colors.surfaceContainerLowest}`
        : `2px dashed ${theme.colors.outlineVariant}`;
      element.style.opacity = visited || selected ? '1' : '0.9';
      if (visited || selected) element.style.boxShadow = '0 2px 8px rgba(44,47,48,0.25)';
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        onMarkerPress?.(marker.id);
      });

      return new maplibregl.Marker({ element })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map);
    });
  }, [
    markers,
    selectedId,
    theme.colors.primary,
    theme.colors.surfaceContainerLowest,
    theme.colors.outlineVariant,
    onMarkerPress,
  ]);

  return <View ref={containerRef as never} style={{ flex: 1 }} />;
}
