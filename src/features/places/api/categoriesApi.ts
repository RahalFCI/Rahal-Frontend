/**
 * Place categories API. Anonymous (publicApiClient). Drives the discover filter
 * chips and supplies the category name the empty `GetPlaceDto.categoryName` lacks.
 */
import { publicApiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { flags } from '../../../config/flags';
import { placeEndpoints } from './endpoints';
import { placeCategoriesSchema, type PlaceCategory } from './schemas';
import { MOCK_CATEGORIES } from '../fixtures/places.fixtures';

export async function getCategories(): Promise<PlaceCategory[]> {
  if (flags.mockData) return zodParse(placeCategoriesSchema, MOCK_CATEGORIES);
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.categories,
  });
  return zodParse(placeCategoriesSchema, data);
}
