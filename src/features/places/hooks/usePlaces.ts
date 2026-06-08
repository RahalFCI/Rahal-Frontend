import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchNearbyPlaces,
  fetchPlaceCategories,
  fetchPlacePhotos,
  fetchPlaces,
  searchPlaces,
  toPlaceMarker,
} from '../api/placesApi';
import type { Coordinates, NearbyPlacesQuery, PlaceMarker } from '../types';
import { placesQueryKeys, quantizeCoordinates } from './queryKeys';

const DEFAULT_PAGE_SIZE = 50;
const DEFAULT_RADIUS_METERS = 5000;

export function useNearbyPlaces(coords: Coordinates | null, categoryId?: string | null) {
  const quantized = quantizeCoordinates(coords);
  const query: NearbyPlacesQuery | null = quantized
    ? {
        coordinates: quantized,
        categoryId,
        radiusInMeters: DEFAULT_RADIUS_METERS,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      }
    : null;

  return useQuery({
    queryKey: query
      ? placesQueryKeys.nearbyPlaces(query)
      : placesQueryKeys.fallbackPlaces(1, DEFAULT_PAGE_SIZE),
    queryFn: ({ signal }) =>
      query ? fetchNearbyPlaces(query, signal) : fetchPlaces(1, DEFAULT_PAGE_SIZE, signal),
    staleTime: 60_000,
  });
}

export function usePlacesFallback(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  return useQuery({
    queryKey: placesQueryKeys.fallbackPlaces(page, pageSize),
    queryFn: ({ signal }) => fetchPlaces(page, pageSize, signal),
    staleTime: 60_000,
  });
}

export function usePlaceCategories() {
  return useQuery({
    queryKey: placesQueryKeys.categories,
    queryFn: ({ signal }) => fetchPlaceCategories(signal),
    staleTime: 5 * 60_000,
  });
}

export function usePlacePhotos(placeId: string | null | undefined) {
  return useQuery({
    queryKey: placeId ? placesQueryKeys.photos(placeId) : ['places', 'photos', 'none'],
    queryFn: ({ signal }) => fetchPlacePhotos(placeId!, signal),
    enabled: Boolean(placeId),
    staleTime: 10 * 60_000,
  });
}

export function usePlaceSearch(query: string, page = 1, pageSize = 20) {
  const normalized = query.trim();

  return useQuery({
    queryKey: placesQueryKeys.search(normalized, page, pageSize),
    queryFn: ({ signal }) => searchPlaces(normalized, page, pageSize, signal),
    enabled: normalized.length >= 2,
    staleTime: 60_000,
  });
}

export function usePlaceMarkers(places: { items?: Parameters<typeof toPlaceMarker>[0][] } | undefined) {
  return useMemo<PlaceMarker[]>(
    () => places?.items?.map((place) => toPlaceMarker(place)) ?? [],
    [places?.items],
  );
}
