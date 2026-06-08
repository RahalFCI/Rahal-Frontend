/**
 * useRefreshToken — TanStack Query mutation wrapping the refresh endpoint.
 * Used by the dev diagnostics screen for manual refresh testing.
 */
import { useMutation } from '@tanstack/react-query';
import { refreshTokens, type TokenDto } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useRefreshToken() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (body: TokenDto) => refreshTokens(body),
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}
