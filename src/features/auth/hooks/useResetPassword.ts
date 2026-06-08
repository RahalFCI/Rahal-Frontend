/**
 * useResetPassword — completes OTP-based password reset.
 */
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { resetPassword, type ResetPasswordDto } from '../api/authApi';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';

export function useResetPassword() {
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: (body: ResetPasswordDto) => resetPassword(body),
    onSuccess: () => {
      toast.show(i18n.t('auth:resetPassword.successToast'));
      router.replace('/(auth)/sign-in');
    },
  });
}
