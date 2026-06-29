/**
 * Maps a social mutation error to a user-facing message. Prefers a caller-supplied
 * fallback key, but special-cases a couple of common backend ValidationError cases
 * (e.g. already-following / already-liked) when an explicit key is provided.
 */
import { ApiError } from '../../../shared/api';
import i18n from '../../../shared/i18n';

export function socialErrorMessage(
  error: unknown,
  fallbackKey: string,
  conflictKey?: string,
): string {
  if (error instanceof ApiError) {
    // The backend returns ValidationError for duplicate follow/like and self-follow.
    if (conflictKey && error.code === 'VALIDATION_FAILED') return i18n.t(conflictKey);
    if (error.code === 'NETWORK') return i18n.t('common:error.network');
  }
  return i18n.t(fallbackKey);
}
