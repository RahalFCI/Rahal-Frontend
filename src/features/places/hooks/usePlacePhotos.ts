/**
 * usePlacePhotos — photos for a place (detail hero + gallery, preview thumbnail).
 */
import { useQuery } from '@tanstack/react-query';
import { getPlacePhotos } from '../api/placePhotosApi';
import { placesKeys } from './usePlaces';

export function usePlacePhotos(placeId: string | null | undefined) {
  return useQuery({
    queryKey: placesKeys.photos(placeId ?? ''),
    queryFn: () => getPlacePhotos(placeId as string),
    enabled: !!placeId,
  });
}
