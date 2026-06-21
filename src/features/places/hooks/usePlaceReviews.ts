/**
 * usePlaceReviews — fetches a place's reviews and exposes both the raw list and a
 * derived `{ average, count }` summary for the detail rating pill.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlaceReviews, summarizeReviews, type RatingSummary } from '../api/placeReviewsApi';
import { placesKeys } from './usePlaces';

export function usePlaceReviews(placeId: string | null | undefined) {
  const query = useQuery({
    queryKey: placesKeys.reviews(placeId ?? ''),
    queryFn: () => getPlaceReviews(placeId as string),
    enabled: !!placeId,
  });

  const summary = useMemo<RatingSummary>(
    () => summarizeReviews(query.data ?? []),
    [query.data],
  );

  return { ...query, summary };
}
