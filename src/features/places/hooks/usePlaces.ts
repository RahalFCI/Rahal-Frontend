/**
 * usePlaces — server state for the places list (TanStack Query). Also exposes a
 * `markers` projection ready for the map abstraction, and `useDiscoverPlaces`,
 * the orchestrator the Discover screen uses to swap between the default list,
 * full-text search, and category filtering without changing its render contract.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MarkerData } from '../../../shared/map/provider';
import { getPlaces, getPlacesByCategory, type GetPlacesParams } from '../api/placesApi';
import { searchPlaces } from '../api/searchApi';
import type { Place } from '../api/schemas';

export const placesKeys = {
  all: ['places'] as const,
  list: (params: GetPlacesParams) => ['places', 'list', params] as const,
  category: (categoryId: string, params: GetPlacesParams) =>
    ['places', 'category', categoryId, params] as const,
  detail: (id: string) => ['places', 'detail', id] as const,
  photos: (id: string) => ['places', 'photos', id] as const,
  reviews: (id: string) => ['places', 'reviews', id] as const,
  /**
   * Discover-screen sources. Kept under a dedicated namespace so they never
   * collide with `list`/`category` (which cache the `PagedResult` envelope, a
   * different shape) — a collision surfaces as `places.map is not a function`
   * when the persisted cache restores the wrong shape under a shared key.
   */
  discover: {
    all: ['places', 'discover', 'all'] as const,
    category: (categoryId: string) => ['places', 'discover', 'category', categoryId] as const,
    search: (query: string) => ['places', 'discover', 'search', query] as const,
  },
};

/** Projects a Place onto the provider-agnostic marker shape. */
export function placeToMarker(place: Place): MarkerData {
  return {
    id: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    title: place.name,
    categoryId: place.placeCategoryId ?? undefined,
    categoryName: place.categoryName ?? undefined,
  };
}

export function usePlaces(params: GetPlacesParams = {}) {
  const query = useQuery({
    queryKey: placesKeys.list(params),
    queryFn: () => getPlaces(params),
  });

  const places = useMemo(() => query.data?.items ?? [], [query.data]);
  const markers = useMemo<MarkerData[]>(() => places.map(placeToMarker), [places]);

  return { ...query, places, markers };
}

export interface DiscoverFilters {
  /** Trimmed full-text query. Non-empty → search source. */
  query?: string;
  /** Selected category id. Used when there is no active search. */
  categoryId?: string | null;
}

/**
 * Source precedence: a non-empty query wins (full-text search), else a selected
 * category filters server-side, else the default paged list. All three normalize
 * to `{ places, markers }` so VectorMap / QuestCard are agnostic to the source.
 */
export function useDiscoverPlaces({ query = '', categoryId = null }: DiscoverFilters = {}) {
  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const result = useQuery({
    queryKey: isSearching
      ? placesKeys.discover.search(trimmedQuery)
      : categoryId
        ? placesKeys.discover.category(categoryId)
        : placesKeys.discover.all,
    queryFn: async (): Promise<Place[]> => {
      if (isSearching) return searchPlaces(trimmedQuery);
      if (categoryId) return (await getPlacesByCategory(categoryId)).items;
      return (await getPlaces()).items;
    },
  });

  // Guard against a persisted cache restoring a non-array shape under this key.
  const places = useMemo(() => (Array.isArray(result.data) ? result.data : []), [result.data]);
  const markers = useMemo<MarkerData[]>(() => places.map(placeToMarker), [places]);

  return { ...result, places, markers };
}
