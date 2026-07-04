/**
 * Opens a vendor's location in the platform maps app. Vendors carry no lat/long
 * (geographic truth lives on `Place`, see CLAUDE.md Decision Log 2026-06-19), so
 * we prefer the vendor's own `addressUrl` and otherwise fall back to a Google
 * Maps text search over the free-text address / display name.
 */
import { Linking } from 'react-native';

export function openVendorLocation(
  addressUrl?: string | null,
  address?: string | null,
  displayName?: string | null,
): void {
  if (addressUrl) {
    Linking.openURL(addressUrl).catch(() => {});
    return;
  }
  const query = [displayName, address].filter(Boolean).join(', ').trim();
  if (!query) return;
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  ).catch(() => {});
}

/** Today's working-hours string from a DayOfWeek→hours map, if present. */
export function todayHours(
  workingHours: Record<string, string> | null | undefined,
): string | null {
  if (!workingHours) return null;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const entry = Object.entries(workingHours).find(
    ([day]) => day.toLowerCase() === today.toLowerCase(),
  );
  return entry?.[1]?.trim() || null;
}
