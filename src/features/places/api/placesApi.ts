/**
 * Places API. Places are anonymous (no auth) — uses publicApiClient, which
 * still unwraps the ApiResponse<T> envelope. Responses are Zod-validated.
 */
import { publicApiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { placeEndpoints } from './endpoints';
import { pagedPlacesSchema, placeSchema, type PagedPlaces, type Place } from './schemas';

export interface GetPlacesParams {
  page?: number;
  pageSize?: number;
}

export async function getPlaces({ page = 1, pageSize = 50 }: GetPlacesParams = {}): Promise<PagedPlaces> {
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedPlacesSchema, data);
}

export async function getPlace(id: string): Promise<Place> {
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.byId(id),
  });
  return zodParse(placeSchema, data);
}
