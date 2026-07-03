/**
 * useCardCheckout — generic Stripe PaymentSheet flow. Given a payer + amount, it
 * creates a PaymentIntent on the backend, hands the returned secrets to Stripe's
 * native sheet, and resolves the outcome. It is deliberately payment-agnostic: the
 * caller (e.g. the Rewards screen) decides what a successful charge means (grant
 * premium, etc.), keeping this reusable for any future card payment.
 *
 * Returns 'succeeded' | 'canceled'. User-cancel is silent; init/charge failures
 * throw and surface a toast. The publishable key comes from the intent response, so
 * Stripe is re-initialised with it before presenting (no frontend key required).
 */
import { useMutation } from '@tanstack/react-query';
import { initStripe, useStripe } from '@stripe/stripe-react-native';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';
import { createPaymentIntent } from '../api/paymentsApi';

export type CardCheckoutResult = 'succeeded' | 'canceled';

export interface CardCheckoutVars {
  /** The paying explorer's id. */
  userId: string;
  /** Amount in major units (e.g. 10.5). */
  amount: number;
  /** Lowercase Stripe currency, e.g. "usd". */
  currency: string;
  /** Business reference (e.g. the plan tier id). */
  referenceId?: string;
}

export function useCardCheckout() {
  const toast = useToast();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  return useMutation<CardCheckoutResult, unknown, CardCheckoutVars>({
    mutationFn: async ({ userId, amount, currency, referenceId }) => {
      const intent = await createPaymentIntent({ userId, amount, currency, referenceId });

      // The backend returns the publishable key; re-init Stripe with it so the demo
      // needs no bundled key. Idempotent — safe to call before every sheet.
      if (intent.publishableKey) {
        await initStripe({ publishableKey: intent.publishableKey });
      }

      const init = await initPaymentSheet({
        merchantDisplayName: 'Rahal',
        // createPaymentIntent guarantees a non-null secret on success.
        paymentIntentClientSecret: intent.paymentIntentClientSecret as string,
        customerId: intent.customerId ?? undefined,
        customerEphemeralKeySecret: intent.ephemeralKeySecret ?? undefined,
        allowsDelayedPaymentMethods: false,
      });
      if (init.error) {
        throw new ApiError('PAYMENT_FAILED', init.error.message, 0);
      }

      const present = await presentPaymentSheet();
      if (present.error) {
        // Tapping the sheet's close button is a normal cancel, not a failure.
        if (present.error.code === 'Canceled') return 'canceled';
        throw new ApiError('PAYMENT_FAILED', present.error.message, 0);
      }

      return 'succeeded';
    },
    onError: (error) => {
      const key =
        error instanceof ApiError && error.code === 'NETWORK'
          ? 'common:error.network'
          : 'payment:error.failed';
      toast.show(i18n.t(key));
    },
  });
}
