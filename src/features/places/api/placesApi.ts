import { apiClient, axiosInstance } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api/zodParse';
import { env } from '../../../config/env';
import {
  pagedResultSchema,
  placeCategorySchema,
  placePhotoSchema,
  placeSchema,
  searchPlaceDocumentSchema,
  searchResultPageSchema,
} from './schemas';
import { placesEndpoints } from './endpoints';
import type {
  NearbyPlacesQuery,
  PagedResult,
  PlaceCategoryDto,
  PlaceDto,
  PlaceMarker,
  PlacePhotoDto,
  SearchPlaceDocument,
  SearchResultPage,
} from '../types';

const placePageSchema = pagedResultSchema(placeSchema);
const placeSearchPageSchema = searchResultPageSchema(searchPlaceDocumentSchema);

function resolveMediaUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function toPlaceMarker(place: PlaceDto): PlaceMarker {
  const addressParts = [
    place.address?.addressLine,
    place.address?.city,
    place.address?.government,
    place.address?.country,
  ].filter(Boolean);

  return {
    id: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    title: place.name,
    description: place.description,
    categoryId: place.placeCategoryId,
    categoryName: place.categoryName,
    ticketPrice: place.ticketPrice,
    geoFenceRange: place.geoFenceRange,
    addressLabel: addressParts.join(', '),
    updatedAt: place.updatedAt ?? place.createdAt,
  };
}

export async function fetchPlaces(
  page = 1,
  pageSize = 50,
  signal?: AbortSignal,
): Promise<PagedResult<PlaceDto>> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: placesEndpoints.places.list,
    params: { page, pageSize },
    signal,
  });

  return zodParse(placePageSchema, data);
}

export async function fetchPlaceDetail(id: string, signal?: AbortSignal): Promise<PlaceDto> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: placesEndpoints.places.detail(id),
    signal,
  });

  return zodParse(placeSchema, data);
}

export async function fetchPlacesByCategory(
  categoryId: string,
  page = 1,
  pageSize = 50,
  signal?: AbortSignal,
): Promise<PagedResult<PlaceDto>> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: placesEndpoints.places.byCategory(categoryId),
    params: { page, pageSize },
    signal,
  });

  return zodParse(placePageSchema, data);
}

export async function fetchNearbyPlaces(
  query: NearbyPlacesQuery,
  signal?: AbortSignal,
): Promise<PagedResult<PlaceDto>> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: placesEndpoints.places.searchNearby,
    params: {
      Latitude: query.coordinates.latitude,
      Longitude: query.coordinates.longitude,
      RadiusInMeters: query.radiusInMeters ?? 5000,
      'offsetPaginationRequest.Page': query.page ?? 1,
      'offsetPaginationRequest.PageSize': query.pageSize ?? 50,
      ...(query.categoryId ? { CategoryId: query.categoryId } : {}),
    },
    signal,
  });

  return zodParse(placePageSchema, data);
}

export async function fetchPlaceCategories(signal?: AbortSignal): Promise<PlaceCategoryDto[]> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: placesEndpoints.categories.list,
    signal,
  });

  return zodParse(placeCategorySchema.array(), data);
}

export async function fetchPlacePhotos(
  placeId: string,
  signal?: AbortSignal,
): Promise<PlacePhotoDto[]> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: placesEndpoints.photos.byPlace(placeId),
    signal,
  });

  return zodParse(placePhotoSchema.array(), data).map((photo) => ({
    ...photo,
    url: resolveMediaUrl(photo.url),
  }));
}

export async function searchPlaces(
  query: string,
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<SearchResultPage<SearchPlaceDocument>> {
  const response = await axiosInstance.request<{
    success: boolean;
    data?: unknown;
    message?: string;
  }>({
    method: 'GET',
    url: placesEndpoints.search.places,
    params: { query, page, pageSize },
    signal,
  });

  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message ?? 'Place search failed');
  }

  return zodParse(placeSearchPageSchema, response.data.data);
}
