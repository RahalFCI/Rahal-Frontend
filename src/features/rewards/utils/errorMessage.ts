/**
 * Translates a thrown error into a localized, user-facing toast message for the
 * rewards mutations. Falls back to a rewards-specific generic message so an
 * ambiguous backend `BusinessRuleViolation` still reads sensibly.
 */
import { ApiError, errorMap } from '../../../shared/api';
import i18n from '../../../shared/i18n';

export function rewardErrorMessage(error: unknown, fallbackKey: string): string {
  if (error instanceof ApiError) {
    // ALREADY_EXISTS maps to an auth-namespaced string; rewards has its own wording.
    if (error.code === 'ALREADY_EXISTS') return i18n.t('rewards:claim.alreadyClaimed');
    // Generic server/business failures fall back to the caller's rewards message.
    if (error.code === 'UNKNOWN' || error.code === 'SERVER') return i18n.t(fallbackKey);
    return i18n.t(errorMap[error.code].messageKey);
  }
  return i18n.t(fallbackKey);
}
