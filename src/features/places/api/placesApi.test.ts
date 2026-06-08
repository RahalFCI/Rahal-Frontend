/* eslint-disable import/first */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../config/env', () => ({
  env: {
    API_BASE_URL: 'http://api.test/api',
    MEDIA_BASE_URL: 'http://api.test',
    DEV_BYPASS_AUTH: false,
    MAPBOX_ACCESS_TOKEN: '',
    MAP_STYLE_URL: 'https://tiles.test/style.json',
  },
}));

import { axiosInstance } from '../../../shared/api/client';
import { fetchNearbyPlaces, fetchPlacePhotos, searchPlaces, toPlaceMarker } from './placesApi';

const place = {
  id: 'b4e37bdc-1368-4d2a-830d-65285d859af4',
  name: 'Cairo Citadel',
  description: 'Historic fortress',
  placeCategoryId: '6875540c-81f5-461f-8e25-f1f3cc0f9764',
  categoryName: 'Historical',
  ticketPrice: 120,
  latitude: 30.0287,
  longitude: 31.2599,
  geoFenceRange: 75,
  address: {
    addressLine: 'Salah Salem',
    city: 'Cairo',
    government: 'Cairo',
    country: 'Egypt',
  },
  createdAt: '2026-06-08T00:00:00Z',
  updatedAt: null,
};

describe('placesApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends nearby search as query params for the current backend binder', async () => {
    const request = vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        data: {
          items: [place],
          totalCount: 1,
          page: 1,
          pageSize: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });

    await expect(
      fetchNearbyPlaces({
        coordinates: { latitude: 30.044, longitude: 31.236 },
        radiusInMeters: 5000,
        page: 1,
        pageSize: 50,
        categoryId: place.placeCategoryId,
      }),
    ).resolves.toMatchObject({ totalCount: 1 });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/Place/search',
        params: expect.objectContaining({
          Latitude: 30.044,
          Longitude: 31.236,
          RadiusInMeters: 5000,
          'offsetPaginationRequest.Page': 1,
          'offsetPaginationRequest.PageSize': 50,
          CategoryId: place.placeCategoryId,
        }),
      }),
    );
  });

  it('normalizes places into marker data', () => {
    expect(toPlaceMarker(place)).toMatchObject({
      id: place.id,
      title: place.name,
      categoryId: place.placeCategoryId,
      addressLabel: 'Salah Salem, Cairo, Cairo, Egypt',
    });
  });

  it('resolves relative photo URLs against the media base URL', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      status: 200,
      data: {
        isSuccess: true,
        data: [{ placeId: place.id, url: '/uploads/citadel.jpg' }],
      },
    });

    await expect(fetchPlacePhotos(place.id)).resolves.toEqual([
      { placeId: place.id, url: 'http://api.test/uploads/citadel.jpg' },
    ]);
  });

  it('uses a dedicated adapter for the non-ApiResponse search envelope', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      status: 200,
      data: {
        success: true,
        data: {
          results: [
            {
              id: place.id,
              name: place.name,
              description: place.description,
              categoryName: place.categoryName,
              latitude: place.latitude,
              longitude: place.longitude,
              ticketPrice: place.ticketPrice,
              city: 'Cairo',
              government: 'Cairo',
              country: 'Egypt',
            },
          ],
          pagination: {
            currentPage: 1,
            pageSize: 20,
            totalPages: 1,
            totalResults: 1,
            hasMore: false,
          },
        },
      },
    });

    await expect(searchPlaces('citadel')).resolves.toMatchObject({
      results: [{ name: 'Cairo Citadel' }],
      pagination: { totalResults: 1 },
    });
  });
});
