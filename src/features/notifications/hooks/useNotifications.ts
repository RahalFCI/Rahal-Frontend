/**
 * useNotifications — the signed-in explorer's notifications (infinite, newest-first).
 * Cursor is an ISO DateTime string; de-dupe happens at render via flattenNotifications.
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { getNotifications } from '../api/notificationsApi';
import { notificationKeys } from './keys';
import { flags } from '../../../config/flags';
import { useAuthStore } from '../../auth/store/authStore';

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id);

  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => getNotifications(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: flags.push && !!userId,
  });
}
