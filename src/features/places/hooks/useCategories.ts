/**
 * useCategories — the place categories that drive the discover filter chips and
 * supply display names for the (empty) GetPlaceDto.categoryName field.
 */
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categoriesApi';

export const categoriesKeys = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30,
  });
}
