/**
 * useMarkRead — mark a single notification read. Optimistically flips the row's
 * `isRead` in the cached list and decrements the unread badge (only when the row
 * was actually unread), rolls back on error, and reconciles on settle.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markRead } from '../api/notificationsApi';
import { markReadInCache } from '../utils/notificationCache';
import { notificationKeys } from './keys';
import type { UnreadCount } from '../api/schemas';

interface MarkReadVars {
  id: string;
  /** The row's read state BEFORE the tap — controls whether the badge decrements. */
  wasUnread: boolean;
}

function bumpUnread(
  queryClient: ReturnType<typeof useQueryClient>,
  delta: number,
): void {
  queryClient.setQueryData(notificationKeys.unread(), (old: UnreadCount | undefined) =>
    old ? { unreadCount: Math.max(0, old.unreadCount + delta) } : old,
  );
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, MarkReadVars>({
    mutationFn: ({ id }) => markRead(id),
    onMutate: async ({ id, wasUnread }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      markReadInCache(queryClient, id);
      if (wasUnread) bumpUnread(queryClient, -1);
    },
    onError: (_e, { wasUnread }) => {
      // Roll back the badge; the list re-syncs on settle below.
      if (wasUnread) bumpUnread(queryClient, 1);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
