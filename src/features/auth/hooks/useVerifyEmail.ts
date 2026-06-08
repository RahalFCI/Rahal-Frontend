/**
 * useVerifyEmail - verifies the registration OTP, then routes to sign in.
 */
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { verifyEmail, type VerifyEmailDto } from '../api/authApi';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';

export function useVerifyEmail() {
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: (body: VerifyEmailDto) => verifyEmail(body),
    onSuccess: () => {
      toast.show(i18n.t('auth:verifyEmail.successToast'));
      router.replace('/(auth)/sign-in');
    },
  });
}
