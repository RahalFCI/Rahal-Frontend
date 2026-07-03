/**
 * Place reviews API. Anonymous (publicApiClient). The detail screen only needs an
 * aggregate (average + count) for its rating pill; the raw list is returned and
 * summarized in the hook.
 */
import { publicApiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { flags } from '../../../config/flags';
import { placeEndpoints } from './endpoints';
import { placeReviewsSchema, type PlaceReview } from './schemas';
import { getMockReviews } from '../fixtures/places.fixtures';

export async function getPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  if (flags.mockData) return zodParse(placeReviewsSchema, getMockReviews(placeId));
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.reviews(placeId),
  });
  return zodParse(placeReviewsSchema, data);
}

export interface RatingSummary {
  average: number;
  count: number;
}

/** Derives a 1-decimal average rating and review count from a review list. */
export function summarizeReviews(reviews: PlaceReview[]): RatingSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
