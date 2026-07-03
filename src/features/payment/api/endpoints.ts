/**
 * Payment endpoints (relative to env.API_BASE_URL, which already includes /api).
 *
 * `testIntent` is the backend's Stripe PaymentSheet helper. Note it is
 * [AllowAnonymous] and returns a RAW body (NOT the ApiResponse<T> envelope), so
 * paymentsApi talks to it through the raw axios instance, not `apiClient`.
 */
export const paymentEndpoints = {
  testIntent: '/payments/test-intent',
} as const;
