/**
 * useUnreadCount — the badge engine. Polls the unread-count endpoint on an interval
 * (and on window focus) so the bell badges on Discover/Social/Profile stay live
 * without any realtime channel (the backend has no SignalR/websocket). Gated behind
 * flags.push and a signed-in user.
 */
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/notificationsApi';
import { notificationKeys } from './keys';
import { flags } from '../../../config/flags';
import { useAuthStore } from '../../auth/store/authStore';

/** Poll cadence for the unread badge. */
const UNREAD_POLL_MS = 30_000;

export function useUnreadCount() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: getUnreadCount,
    enabled: flags.push && !!userId,
    refetchInterval: UNREAD_POLL_MS,
    refetchOnWindowFocus: true,
    // The badge is disposable UI; a transient failure should not surface an error.
    select: (data) => data.unreadCount,
  });
}
