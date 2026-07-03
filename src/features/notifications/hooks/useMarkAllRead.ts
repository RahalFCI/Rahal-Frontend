/**
 * useMarkAllRead — mark every notification read. Optimistically flips all cached
 * rows and zeroes the unread badge, rolls back on error (toast), reconciles on settle.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/components/Toast';
import i18n from '../../../shared/i18n';
import { markAllRead } from '../api/notificationsApi';
import { markReadInCache } from '../utils/notificationCache';
import { notificationKeys } from './keys';
import type { UnreadCount } from '../api/schemas';

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<void, unknown, void>({
    mutationFn: () => markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const prevUnread = queryClient.getQueryData<UnreadCount>(notificationKeys.unread());
      markReadInCache(queryClient);
      queryClient.setQueryData(notificationKeys.unread(), { unreadCount: 0 });
      return { prevUnread };
    },
    onError: (_e, _v, context) => {
      const prev = (context as { prevUnread?: UnreadCount } | undefined)?.prevUnread;
      if (prev) queryClient.setQueryData(notificationKeys.unread(), prev);
      toast.show(i18n.t('notifications:error.markAllFailed'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
