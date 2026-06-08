/**
 * useSignUp — TanStack Query mutation wrapping the register endpoint.
 * On success: navigates to email verification with a toast.
 */
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { register, type RegisterExplorerDto } from '../api/authApi';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';

export function useSignUp() {
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: (body: RegisterExplorerDto) => register(body),
    onSuccess: (_data, variables) => {
      // Backend requires email confirmation before login, so verify before sign-in.
      toast.show(i18n.t('auth:signUp.successToast'));
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: variables.email },
      });
    },
  });
}
