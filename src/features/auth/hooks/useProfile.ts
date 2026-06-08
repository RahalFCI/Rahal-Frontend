/**
 * useProfile — TanStack Query hook for fetching the current explorer's profile.
 * Calls GET /api/explorer/{id}. Enabled only when userId is defined.
 */
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api/errors';
import { getExplorerProfile } from '../api/authApi';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getExplorerProfile(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === 'PROFILE_SETUP_REQUIRED') {
        return false;
      }
      return failureCount < 3;
    },
  });
}
