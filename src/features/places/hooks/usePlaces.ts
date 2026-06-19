/**
 * usePlaces — server state for the places list (TanStack Query). Also exposes a
 * `markers` projection ready for the map abstraction.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MarkerData } from '../../../shared/map/provider';
import { getPlaces, type GetPlacesParams } from '../api/placesApi';
import type { Place } from '../api/schemas';

export const placesKeys = {
  all: ['places'] as const,
  list: (params: GetPlacesParams) => ['places', 'list', params] as const,
};

export function usePlaces(params: GetPlacesParams = {}) {
  const query = useQuery({
    queryKey: placesKeys.list(params),
    queryFn: () => getPlaces(params),
  });

  const places = useMemo(() => query.data?.items ?? [], [query.data]);

  const markers = useMemo<MarkerData[]>(
    () => places.map(placeToMarker),
    [places],
  );

  return { ...query, places, markers };
}

function placeToMarker(place: Place): MarkerData {
  return {
    id: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    title: place.name,
    categoryId: place.placeCategoryId ?? undefined,
    categoryName: place.categoryName ?? undefined,
  };
}
