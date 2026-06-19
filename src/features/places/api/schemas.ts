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

export type Place = z.infer<typeof placeSchema>;
export type PagedPlaces = z.infer<typeof pagedPlacesSchema>;
