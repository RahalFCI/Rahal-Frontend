/**
 * Places API. Places are anonymous (no auth) — uses publicApiClient, which
 * still unwraps the ApiResponse<T> envelope. Responses are Zod-validated.
 */
import { publicApiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { flags } from '../../../config/flags';
import { placeEndpoints } from './endpoints';
import { pagedPlacesSchema, placeSchema, type PagedPlaces, type Place } from './schemas';
import { getMockPlace, getMockPlaces, getMockPlacesByCategory } from '../fixtures/places.fixtures';

export interface GetPlacesParams {
  page?: number;
  pageSize?: number;
}

/** Wraps a list of places in the backend's PagedResult envelope. */
function toPagedResult(items: Place[], page: number, pageSize: number): PagedPlaces {
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return {
    items: pageItems,
    totalCount: items.length,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function getPlaces({ page = 1, pageSize = 50 }: GetPlacesParams = {}): Promise<PagedPlaces> {
  if (flags.mockData) return toPagedResult(getMockPlaces(), page, pageSize);
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedPlacesSchema, data);
}

export async function getPlace(id: string): Promise<Place> {
  if (flags.mockData) {
    const place = getMockPlace(id);
    if (place) return zodParse(placeSchema, place);
  }
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.byId(id),
  });
  return zodParse(placeSchema, data);
}

export async function getPlacesByCategory(
  categoryId: string,
  { page = 1, pageSize = 50 }: GetPlacesParams = {},
): Promise<PagedPlaces> {
  if (flags.mockData) return toPagedResult(getMockPlacesByCategory(categoryId), page, pageSize);
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.byCategory(categoryId),
    params: { page, pageSize },
  });
  return zodParse(pagedPlacesSchema, data);
}
