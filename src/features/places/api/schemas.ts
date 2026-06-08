import { z } from 'zod';

export const addressSchema = z.object({
  addressLine: z.string().nullish(),
  government: z.string(),
  city: z.string(),
  country: z.string(),
});

export const placeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  placeCategoryId: z.string().uuid(),
  categoryName: z.string(),
  ticketPrice: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  geoFenceRange: z.number().int(),
  address: addressSchema.nullish(),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
});

export const placeCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  placeCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string().nullish(),
});

export const placePhotoSchema = z.object({
  placeId: z.string().uuid(),
  url: z.string(),
});

export function pagedResultSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    totalCount: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  });
}

export const searchPlaceDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  ticketPrice: z.number(),
  city: z.string(),
  government: z.string(),
  country: z.string(),
});

export function searchResultPageSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    results: z.array(itemSchema),
    pagination: z.object({
      currentPage: z.number().int(),
      pageSize: z.number().int(),
      totalPages: z.number().int(),
      totalResults: z.number().int(),
      hasMore: z.boolean(),
    }),
  });
}
