/**
 * Editorial formatting helpers for the rewards catalog (LabelCaps lines). Mirrors
 * the gamification `format` helpers without coupling the feature folders.
 */
import i18n from '../../../shared/i18n';
import type { Coupon } from '../api/schemas';

/** All-caps discount summary, e.g. "20% OFF" or "EGP 50 OFF". */
export function formatDiscount(coupon: Coupon): string {
  const value = coupon.discountValue;
  if (coupon.discountType === 'Percentage') {
    return i18n.t('rewards:coupon.discountPercentage', { value });
  }
  return i18n.t('rewards:coupon.discountFixed', { value });
}

/** Forward-looking, all-caps expiry line, e.g. "EXPIRES IN 3 DAYS" / "EXPIRED". */
export function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return '';
  const expiry = Date.parse(iso);
  if (Number.isNaN(expiry)) return '';

  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.ceil((startOfDay(expiry) - startOfDay(Date.now())) / dayMs);

  if (days < 0) return i18n.t('rewards:coupon.expired');
  if (days === 0) return i18n.t('rewards:coupon.expiresToday');
  if (days < 7) return i18n.t('rewards:coupon.expiresInDays', { count: days });

  return i18n.t('rewards:coupon.expiresOn', {
    date: new Date(expiry)
      .toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      .toUpperCase(),
  });
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
