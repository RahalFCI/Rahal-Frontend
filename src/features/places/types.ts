import type { MapBounds } from '../../shared/map/types';

export interface AddressDto {
  addressLine?: string | null;
  government: string;
  city: string;
  country: string;
}

export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  placeCategoryId: string;
  categoryName: string;
  ticketPrice: number;
  latitude: number;
  longitude: number;
  geoFenceRange: number;
  address?: AddressDto | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PlaceCategoryDto {
  id: string;
  name: string;
  description: string;
  placeCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PlacePhotoDto {
  placeId: string;
  url: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchPlaceDocument {
  id: string;
  name: string;
  description: string;
  categoryName: string;
  latitude: number;
  longitude: number;
  ticketPrice: number;
  city: string;
  government: string;
  country: string;
}

export interface SearchResultPage<T> {
  results: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyPlacesQuery {
  coordinates: Coordinates;
  radiusInMeters?: number;
  page?: number;
  pageSize?: number;
  categoryId?: string | null;
  bounds?: MapBounds;
}

export interface PlaceMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  ticketPrice: number;
  geoFenceRange: number;
  addressLabel: string;
  updatedAt?: string | null;
}
