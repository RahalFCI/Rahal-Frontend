/**
 * Translates a thrown error into a localized, user-facing toast message for the
 * rewards mutations. Falls back to a rewards-specific generic message so an
 * ambiguous backend `BusinessRuleViolation` still reads sensibly.
 *
 * `alreadyExistsKey` lets each caller word the ALREADY_EXISTS case for its own
 * context (a claimed coupon vs. an existing subscription); it defaults to the
 * generic fallback when the caller has no specific copy.
 */
import { ApiError, errorMap } from '../../../shared/api';
import i18n from '../../../shared/i18n';

export function rewardErrorMessage(
  error: unknown,
  fallbackKey: string,
  alreadyExistsKey: string = fallbackKey,
): string {
  if (error instanceof ApiError) {
    // ALREADY_EXISTS maps to an auth-namespaced string; rewards words it per context.
    if (error.code === 'ALREADY_EXISTS') return i18n.t(alreadyExistsKey);
    // Generic server/business failures fall back to the caller's rewards message.
    if (error.code === 'UNKNOWN' || error.code === 'SERVER') return i18n.t(fallbackKey);
    return i18n.t(errorMap[error.code].messageKey);
  }
  return i18n.t(fallbackKey);
}
