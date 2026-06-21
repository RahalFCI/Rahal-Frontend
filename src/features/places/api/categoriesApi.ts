/**
 * Place categories API. Anonymous (publicApiClient). Drives the discover filter
 * chips and supplies the category name the empty `GetPlaceDto.categoryName` lacks.
 */
import { publicApiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { placeEndpoints } from './endpoints';
import { placeCategoriesSchema, type PlaceCategory } from './schemas';

export async function getCategories(): Promise<PlaceCategory[]> {
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.categories,
  });
  return zodParse(placeCategoriesSchema, data);
}
