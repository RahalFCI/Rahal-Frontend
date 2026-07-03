/**
 * Premium subscription API — PlanTier catalog (any authenticated role) plus the
 * Explorer-only subscription lifecycle (purchase with XP, view active, cancel).
 */
import { apiClient } from '../../../shared/api/client';
import { ApiError, zodParse } from '../../../shared/api';
import { planTierEndpoints, subscriptionEndpoints } from './endpoints';
import {
  pagedPlanTiersSchema,
  subscriptionSchema,
  type PagedPlanTiers,
  type Subscription,
} from './schemas';

export interface GetPlanTiersParams {
  page?: number;
  pageSize?: number;
}

export async function getPlanTiers({
  page = 1,
  pageSize = 50,
}: GetPlanTiersParams = {}): Promise<PagedPlanTiers> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: planTierEndpoints.list,
    params: { page, pageSize },
  });
  return zodParse(pagedPlanTiersSchema, data);
}

/** SubscriptionPaymentMethod enum: Xp = 0, Visa = 1. */
export const SubscriptionPaymentMethod = { Xp: 0, Visa: 1 } as const;
export type SubscriptionPaymentMethodValue =
  (typeof SubscriptionPaymentMethod)[keyof typeof SubscriptionPaymentMethod];

export interface PurchaseSubscriptionParams {
  planTierId: string;
  /**
   * How the subscription is paid for. Defaults to XP (the in-app currency path).
   * `Visa` activates premium after a real card charge collected via Stripe on the
   * client (see `useActivatePremiumWithCard`) — the backend grants premium
   * synchronously and does not itself take a card.
   */
  paymentMethod?: SubscriptionPaymentMethodValue;
}

export async function purchaseSubscription({
  planTierId,
  paymentMethod = SubscriptionPaymentMethod.Xp,
}: PurchaseSubscriptionParams): Promise<Subscription> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: subscriptionEndpoints.purchase,
    data: { planTierId, paymentMethod },
  });
  return zodParse(subscriptionSchema, data);
}

/** The active subscription, or `null` when the explorer has none (backend 404). */
export async function getActiveSubscription(): Promise<Subscription | null> {
  try {
    const data = await apiClient<unknown>({
      method: 'GET',
      url: subscriptionEndpoints.active,
    });
    return zodParse(subscriptionSchema, data);
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NOT_FOUND') return null;
    throw error;
  }
}

/** Cancels the active subscription. Returns the backend's confirmation message. */
export async function cancelSubscription(): Promise<string> {
  const data = await apiClient<string>({
    method: 'PUT',
    url: subscriptionEndpoints.cancel,
  });
  return typeof data === 'string' ? data : '';
}
