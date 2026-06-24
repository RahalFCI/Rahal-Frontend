/**
 * Client-side claim eligibility. The backend collapses several failure modes into a
 * single ambiguous `BusinessRuleViolation`, so we pre-check here to disable the claim
 * button and show a precise reason (CLAUDE.md §6.4 — surface the recovery, not a
 * generic error). The backend remains the source of truth; this is UX, not security.
 */
import type { Coupon } from '../api/schemas';

export type ClaimBlockReason = 'INSUFFICIENT_XP' | 'SOLD_OUT' | 'EXPIRED' | 'INACTIVE';

export interface Claimability {
  claimable: boolean;
  /** null when claimable; otherwise the (highest-priority) blocking reason. */
  reason: ClaimBlockReason | null;
}

/** Remaining stock — prefers the server-computed field, falls back to max − current. */
export function remainingClaims(coupon: Coupon): number {
  if (coupon.remainingClaims != null) return coupon.remainingClaims;
  return Math.max(0, coupon.maxClaims - (coupon.currentClaims ?? 0));
}

export function isExpired(coupon: Coupon, now: Date = new Date()): boolean {
  const expiry = new Date(coupon.expiresAt).getTime();
  return Number.isFinite(expiry) && expiry <= now.getTime();
}

/**
 * Evaluates whether the explorer can claim `coupon` given their spendable balance.
 * Reasons are checked in severity order so the most actionable one wins.
 */
export function claimability(
  coupon: Coupon,
  availableXp: number,
  now: Date = new Date(),
): Claimability {
  if (!coupon.isActive) return { claimable: false, reason: 'INACTIVE' };
  if (isExpired(coupon, now)) return { claimable: false, reason: 'EXPIRED' };
  if (remainingClaims(coupon) <= 0) return { claimable: false, reason: 'SOLD_OUT' };
  if (availableXp < coupon.xpCost) return { claimable: false, reason: 'INSUFFICIENT_XP' };
  return { claimable: true, reason: null };
}
