/**
 * usePlace — server state for a single place (the detail screen). Seeds itself
 * from any cached list entry so the screen can paint instantly on navigation.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlace } from '../api/placesApi';
import type { Place } from '../api/schemas';
import { placesKeys } from './usePlaces';

export function usePlace(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: placesKeys.detail(id),
    queryFn: () => getPlace(id),
    enabled: !!id,
    placeholderData: () =>
      queryClient
        .getQueriesData<{ items?: Place[] } | Place[]>({ queryKey: placesKeys.all })
        .flatMap(([, data]) =>
          Array.isArray(data) ? data : (data?.items ?? []),
        )
        .find((place) => place?.id === id),
  });
}
