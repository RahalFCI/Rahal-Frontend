import type { Coordinates, NearbyPlacesQuery } from '../types';

const COORDINATE_PRECISION = 3;

export function quantizeCoordinate(value: number) {
  return Number(value.toFixed(COORDINATE_PRECISION));
}

export function quantizeCoordinates(coords: Coordinates | null | undefined) {
  if (!coords) return null;
  return {
    latitude: quantizeCoordinate(coords.latitude),
    longitude: quantizeCoordinate(coords.longitude),
  };
}

export const placesQueryKeys = {
  categories: ['places', 'categories'] as const,
  fallbackPlaces: (page: number, pageSize: number) =>
    ['places', 'fallback', page, pageSize] as const,
  nearbyPlaces: (query: NearbyPlacesQuery) =>
    [
      'places',
      'nearby',
      quantizeCoordinates(query.coordinates),
      query.radiusInMeters ?? 5000,
      query.categoryId ?? 'all',
      query.page ?? 1,
      query.pageSize ?? 50,
    ] as const,
  photos: (placeId: string) => ['places', 'photos', placeId] as const,
  search: (query: string, page: number, pageSize: number) =>
    ['places', 'search', query.trim().toLowerCase(), page, pageSize] as const,
};
