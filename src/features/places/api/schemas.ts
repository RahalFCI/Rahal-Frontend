/**
 * Zod schemas for Place responses — validated at the client boundary to catch
 * backend contract drift early (CLAUDE.md §2.3 rule 5). Mirrors GetPlaceDto and
 * PagedResult<T> from docs/backend-api-reference.md.
 */
import { z } from 'zod';

export const addressSchema = z.object({
  addressLine: z.string().nullish(),
  government: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
});

export const placeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  placeCategoryId: z.string().nullish(),
  categoryName: z.string().nullish(),
  ticketPrice: z.number().nullish(),
  latitude: z.number(),
  longitude: z.number(),
  geoFenceRange: z.number().nullish(),
  address: addressSchema.nullish(),
  /**
   * Soft reference to the operating vendor (docs/backend-vendor-place-proposal.md).
   * `null`/absent = admin-curated relic; set = vendor-operated place → the detail
   * screen renders the vendor variant. Backend has not shipped this field yet, so
   * it is always absent today and the place variant is the active path.
   */
  vendorId: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export const pagedPlacesSchema = z.object({
  items: z.array(placeSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

/** GetPlacePhotoDto — `url` may be relative (`/uploads/...`). */
export const placePhotoSchema = z.object({
  placeId: z.string(),
  url: z.string(),
});
export const placePhotosSchema = z.array(placePhotoSchema);

/** GetPlaceReviewDto — used to derive an aggregate rating for the detail header. */
export const placeReviewSchema = z.object({
  explorerId: z.string().nullish(),
  placeId: z.string().nullish(),
  checkInId: z.string().nullish(),
  rating: z.number(),
  comment: z.string().nullish(),
  isVerified: z.boolean().nullish(),
  placeName: z.string().nullish(),
});
export const placeReviewsSchema = z.array(placeReviewSchema);

/** GetPlaceCategoryDto — drives the filter chips. */
export const placeCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  placeCount: z.number().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export const placeCategoriesSchema = z.array(placeCategorySchema);

/**
 * PlaceSearchDocument — the hit shape from `/Search/places` (flat city/government
 * rather than a nested address). Carries coordinates so results drop onto the map.
 */
export const placeSearchDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  categoryName: z.string().nullish(),
  latitude: z.number(),
  longitude: z.number(),
  ticketPrice: z.number().nullish(),
  city: z.string().nullish(),
  government: z.string().nullish(),
  country: z.string().nullish(),
});

/** Non-standard `/Search/*` envelope (CLAUDE.md / backend-api-reference §Search). */
export const placeSearchEnvelopeSchema = z.object({
  success: z.boolean().nullish(),
  data: z.object({
    results: z.array(placeSearchDocumentSchema),
    pagination: z
      .object({
        currentPage: z.number().nullish(),
        pageSize: z.number().nullish(),
        totalPages: z.number().nullish(),
        totalResults: z.number().nullish(),
        hasMore: z.boolean().nullish(),
      })
      .nullish(),
  }),
});

export type Place = z.infer<typeof placeSchema>;
export type PagedPlaces = z.infer<typeof pagedPlacesSchema>;
export type PlacePhoto = z.infer<typeof placePhotoSchema>;
export type PlaceReview = z.infer<typeof placeReviewSchema>;
export type PlaceCategory = z.infer<typeof placeCategorySchema>;
export type PlaceSearchDocument = z.infer<typeof placeSearchDocumentSchema>;
