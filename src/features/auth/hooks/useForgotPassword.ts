/**
 * useForgotPassword — starts the password reset flow.
 */
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { forgotPassword, type ForgotPasswordDto } from '../api/authApi';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';

export function useForgotPassword() {
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: (body: ForgotPasswordDto) => forgotPassword(body),
    onSuccess: (_data, variables) => {
      toast.show(i18n.t('auth:forgotPassword.successToast'));
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: variables.email },
      });
    },
  });
}
