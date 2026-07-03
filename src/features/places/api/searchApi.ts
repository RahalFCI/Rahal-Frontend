/**
 * Full-text place search. `/Search/*` uses a NON-standard envelope
 * (`{ success, data: { results, pagination } }`), so it must bypass the standard
 * ApiResponse unwrapper — we hit the raw axios instance and read `data.data`.
 * Results are adapted to the app-wide `Place` shape so the map, preview card, and
 * detail navigation stay uniform (CLAUDE.md §2.3).
 */
import { publicAxiosInstance } from '../../../shared/api/client';
import { ApiError, zodParse } from '../../../shared/api';
import { flags } from '../../../config/flags';
import { placeEndpoints } from './endpoints';
import {
  placeSearchEnvelopeSchema,
  type Place,
  type PlaceSearchDocument,
} from './schemas';
import { searchMockPlaces } from '../fixtures/places.fixtures';

/** Adapts a flat search document into the nested `Place` shape used everywhere. */
export function searchDocToPlace(doc: PlaceSearchDocument): Place {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    categoryName: doc.categoryName,
    ticketPrice: doc.ticketPrice,
    latitude: doc.latitude,
    longitude: doc.longitude,
    address: {
      city: doc.city,
      government: doc.government,
      country: doc.country,
    },
  };
}

export interface SearchPlacesParams {
  page?: number;
  pageSize?: number;
}

export async function searchPlaces(
  query: string,
  { page = 1, pageSize = 50 }: SearchPlacesParams = {},
): Promise<Place[]> {
  if (flags.mockData) return searchMockPlaces(query);
  try {
    const response = await publicAxiosInstance.get<unknown>(placeEndpoints.search, {
      params: { query, page, pageSize },
    });
    const envelope = zodParse(placeSearchEnvelopeSchema, response.data);
    return envelope.data.results.map(searchDocToPlace);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK', 'Search request failed', 0);
  }
}
