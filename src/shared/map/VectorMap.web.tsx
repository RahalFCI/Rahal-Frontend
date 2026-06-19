import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import maplibregl from 'maplibre-gl';
import { useTheme } from '../theme';
import { resolveMapStyle } from './mapStyle';
import type { MapCameraState, MapProviderCapabilities, MarkerData, Region } from './types';

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
  showUserLocation?: boolean;
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
  showUserLocation = true,
}: VectorMapProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: resolveMapStyle() as string | maplibregl.StyleSpecification,
      center: [region.longitude, region.latitude],
      zoom: region.zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = markers.map((marker) => {
      const element = document.createElement('div');
      element.style.width = '16px';
      element.style.height = '16px';
      element.style.borderRadius = '8px';
      element.style.cursor = 'pointer';
      element.style.backgroundColor = theme.colors.primary;
      element.style.border = `2px solid ${theme.colors.onPrimary}`;
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        onMarkerPress?.(marker.id);
      });

      return new maplibregl.Marker({ element })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map);
    });
  }, [markers, theme.colors.primary, theme.colors.onPrimary, onMarkerPress]);

  return <View ref={containerRef as never} style={{ flex: 1 }} />;
}
