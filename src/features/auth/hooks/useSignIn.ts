/**
 * useSignIn — TanStack Query mutation wrapping the login endpoint.
 * On success: stores session and navigates to the explorer shell.
 */
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { login, type AuthRequestDto } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useSignIn() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (body: AuthRequestDto) => login(body),
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      router.replace('/(explorer)');
    },
  });
}
