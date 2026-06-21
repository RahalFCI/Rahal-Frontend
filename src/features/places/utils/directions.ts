/**
 * Opens the platform maps app at a coordinate (or a supplied map url). Used by the
 * NAVIGATE / MAP detail actions. Falls back to a universal Google Maps url.
 */
import { Linking, Platform } from 'react-native';

export function openDirections(
  latitude: number,
  longitude: number,
  label?: string,
  mapUrl?: string | null,
): void {
  if (mapUrl) {
    Linking.openURL(mapUrl).catch(() => {});
    return;
  }

  const encodedLabel = label ? encodeURIComponent(label) : '';
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });

  Linking.openURL(url).catch(() => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    ).catch(() => {});
  });
}
