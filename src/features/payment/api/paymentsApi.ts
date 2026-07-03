/**
 * Payment API — creates a Stripe PaymentIntent via the backend test-intent helper.
 *
 * This endpoint is [AllowAnonymous] and returns a RAW body (no ApiResponse<T>
 * envelope), so it can't go through `apiClient`/`publicApiClient` (those expect
 * `{ isSuccess, data }` and would throw on `data === undefined`). Instead we use the
 * raw `publicAxiosInstance` — the "endpoint-specific adapter" seam the client exposes —
 * validate with Zod, and throw a typed `PAYMENT_FAILED` on `isSuccess === false`.
 */
import { isAxiosError } from 'axios';
import { publicAxiosInstance } from '../../../shared/api/client';
import { ApiError, zodParse } from '../../../shared/api';
import { paymentEndpoints } from './endpoints';
import { paymentIntentSchema, type PaymentIntent } from './schemas';

export interface CreatePaymentIntentParams {
  /** Test/explorer user id (the paying explorer). */
  userId: string;
  /** Amount in major units (e.g. 10.5 = $10.50). Must be > 0. */
  amount: number;
  /** Lowercase Stripe currency, e.g. "usd". */
  currency: string;
  /** GUID for the related business reference (e.g. the plan tier). Backend generates one if omitted. */
  referenceId?: string;
  /** GUID for this payment operation. Backend generates one if omitted. */
  operationId?: string;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
): Promise<PaymentIntent> {
  try {
    const response = await publicAxiosInstance.request<unknown>({
      method: 'POST',
      url: paymentEndpoints.testIntent,
      data: params,
    });

    const intent = zodParse(paymentIntentSchema, response.data);

    if (!intent.isSuccess || !intent.paymentIntentClientSecret) {
      throw new ApiError(
        'PAYMENT_FAILED',
        intent.message ?? 'Failed to create payment intent',
        response.status,
      );
    }

    return intent;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isAxiosError(error)) {
      if (!error.response) throw new ApiError('NETWORK', error.message, 0);
      throw new ApiError('PAYMENT_FAILED', error.message, error.response.status);
    }
    throw new ApiError('PAYMENT_FAILED', 'Payment request failed', 0);
  }
}
