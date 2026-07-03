/**
 * Zod schema for the backend's Stripe test-intent response — validated at the
 * client boundary (CLAUDE.md §2.3 rule 5).
 *
 * This endpoint BYPASSES the standard ApiResponse<T> envelope: it returns a flat
 * object `{ isSuccess, paymentIntentClientSecret, customerId, ephemeralKeySecret,
 * publishableKey, ... }`. Backend serializes enums as string names
 * (JsonStringEnumConverter), so `errorCode` arrives as e.g. "None"/"ValidationError".
 * Secrets are `.nullish()` because they are null on failure.
 */
import { z } from 'zod';

export const paymentIntentSchema = z.object({
  operationId: z.string().nullish(),
  isSuccess: z.boolean(),
  errorCode: z.string().nullish(),
  transactionId: z.string().nullish(),
  message: z.string().nullish(),
  paymentIntentClientSecret: z.string().nullish(),
  customerId: z.string().nullish(),
  ephemeralKeySecret: z.string().nullish(),
  publishableKey: z.string().nullish(),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;
