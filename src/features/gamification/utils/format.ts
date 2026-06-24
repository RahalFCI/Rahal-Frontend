/**
 * Editorial formatting helpers for cataloging metadata (LabelCaps lines).
 * Dates read like archival entries ("YESTERDAY", "4 DAYS AGO"), not timestamps.
 */
import i18n from '../../../shared/i18n';

/** Relative, all-caps cataloging date. Falls back to a short absolute date. */
export function formatCatalogDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((startOfDay(now) - startOfDay(then)) / dayMs);

  if (days <= 0) return i18n.t('gamification:date.today');
  if (days === 1) return i18n.t('gamification:date.yesterday');
  if (days < 7) return i18n.t('gamification:date.daysAgo', { count: days });

  return new Date(then)
    .toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    .toUpperCase();
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Human label for an XpTransaction.sourceType (CheckIn, Achievement, Challenge…). */
export function formatXpSource(sourceType: string | null | undefined): string {
  const key = `gamification:xp.source.${(sourceType ?? '').toLowerCase()}`;
  const translated = i18n.t(key);
  // i18next returns the key itself when missing — fall back to the raw source.
  return translated === key ? (sourceType ?? i18n.t('gamification:xp.source.unknown')) : translated;
}
