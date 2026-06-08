/**
 * useResendVerification — requests a fresh email verification OTP.
 */
import { useMutation } from '@tanstack/react-query';
import { resendVerification, type ResendVerificationDto } from '../api/authApi';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';

export function useResendVerification() {
  const toast = useToast();

  return useMutation({
    mutationFn: (body: ResendVerificationDto) => resendVerification(body),
    onSuccess: () => {
      toast.show(i18n.t('auth:verifyEmail.resendSuccess'));
    },
  });
}
