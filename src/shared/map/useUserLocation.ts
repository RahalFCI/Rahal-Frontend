/**
 * useUserLocation — foreground location permission + one-shot position fetch.
 *
 * Wraps `expo-location` (works on native and web). The map's recenter control
 * calls `locate()` on demand; the puck visibility keys off `permission`.
 */
import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinates } from './types';

export type LocationPermission = 'undetermined' | 'granted' | 'denied';

export interface UseUserLocation {
  permission: LocationPermission;
  coordinates: Coordinates | null;
  isLocating: boolean;
  /** Requests permission (if needed) and resolves the current position, or null. */
  locate: () => Promise<Coordinates | null>;
}

export function useUserLocation(): UseUserLocation {
  const [permission, setPermission] = useState<LocationPermission>('undetermined');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const locate = useCallback(async (): Promise<Coordinates | null> => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermission('denied');
        return null;
      }
      setPermission('granted');

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoordinates(next);
      return next;
    } catch {
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  return { permission, coordinates, isLocating, locate };
}
