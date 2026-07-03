/**
 * Cache helpers for notifications. The list is an infinite query; these flatten +
 * de-dupe its pages (guarding against the backend's seconds-granular keyset cursor)
 * and patch a single row's `isRead` across the cached pages for optimistic reads.
 */
import type { QueryClient } from '@tanstack/react-query';
import type { Notification, NotificationsPage } from '../api/schemas';
import { notificationKeys } from '../hooks/keys';

type InfiniteNotifications = { pages: NotificationsPage[]; pageParams: unknown[] };

/** Flatten infinite notification pages into a de-duped array. */
export function flattenNotifications(data: InfiniteNotifications | undefined): Notification[] {
  if (!data?.pages) return [];
  const seen = new Set<string>();
  const out: Notification[] = [];
  for (const page of data.pages) {
    for (const n of page.notifications ?? []) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        out.push(n);
      }
    }
  }
  return out;
}

/**
 * Mark rows read in the cached list. Pass a single id, or omit `id` to mark every
 * row read (read-all). Returns nothing; callers snapshot before mutating for rollback.
 */
export function markReadInCache(queryClient: QueryClient, id?: string): void {
  queryClient.setQueriesData({ queryKey: notificationKeys.list() }, (old: unknown) => {
    if (!old || typeof old !== 'object' || !('pages' in old)) return old;
    const feed = old as InfiniteNotifications;
    return {
      ...feed,
      pages: feed.pages.map((page) =>
        page && Array.isArray(page.notifications)
          ? {
              ...page,
              notifications: page.notifications.map((n) =>
                !id || n.id === id ? { ...n, isRead: true } : n,
              ),
            }
          : page,
      ),
    };
  });
}
