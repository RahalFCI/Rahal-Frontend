/**
 * useSignOut — Purges auth store, clears query cache, navigates to Welcome.
 * The API call is fire-and-forget: even if it fails, local session is cleared.
 */
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  const signOut = useCallback(async () => {
    // Fire-and-forget logout API call
    logout().catch(() => {});

    // NOTE: the backend exposes no DELETE /notifications/fcm-token, so we cannot
    // de-register this device's push token on logout. The stale token lingers
    // server-side until the next login on this device overwrites it (backend gap).

    clearSession();
    queryClient.clear();
    router.replace('/(auth)/welcome');
  }, [clearSession, queryClient, router]);

  return signOut;
}
