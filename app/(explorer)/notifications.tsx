/**
 * Notifications screen — the explorer's cataloged activity ("dispatches"). A plain
 * chronological list of server-rendered notifications: likes, comments, follows, and
 * new posts from people they follow. Infinite scroll, pull to refresh, mark-all-read.
 * Editorial per CLAUDE.md §3.2 — a ledger of entries, not an alert center.
 */
import { useMemo } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, CheckCheck } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { tokens } from '../../src/shared/theme';
import { useNotifications } from '../../src/features/notifications/hooks/useNotifications';
import { useUnreadCount } from '../../src/features/notifications/hooks/useUnreadCount';
import { useMarkAllRead } from '../../src/features/notifications/hooks/useMarkAllRead';
import { flattenNotifications } from '../../src/features/notifications/utils/notificationCache';
import { NotificationRow } from '../../src/features/notifications/components/NotificationRow';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation('notifications');

  const query = useNotifications();
  const { data: unread } = useUnreadCount();
  const markAllRead = useMarkAllRead();
  const items = useMemo(() => flattenNotifications(query.data), [query.data]);

  const hasUnread = (unread ?? 0) > 0;

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-end justify-between pt-[16px] pl-[8px] pr-[16px]">
          <View className="flex-row items-end gap-[4px]">
            <Pressable
              onPress={() => router.back()}
              className="p-[8px] mb-[2px]"
              accessibilityLabel={t('back')}
            >
              <ChevronLeft size={24} color={tokens.colors.onSurface} strokeWidth={2} />
            </Pressable>
            <OffsetHeadline title={t('title')} />
          </View>
          {hasUnread ? (
            <Pressable
              onPress={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex-row items-center gap-[7px] pl-[12px] pr-[14px] py-[9px] rounded-full bg-primary-container/50"
              accessibilityLabel={t('markAll')}
            >
              <CheckCheck size={18} color={tokens.colors.primary} strokeWidth={2} />
              <Text variant="labelMedium" className="text-primary font-bold">
                {t('markAll')}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {query.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={tokens.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <NotificationRow notification={item} />}
            ListEmptyComponent={
              <Surface tone="lowest" className="mx-[24px] mt-[8px] p-[24px] rounded-lg gap-[8px]">
                <Text variant="bodyLarge" className="font-bold text-on-surface">
                  {t('empty')}
                </Text>
                <LabelCaps className="text-on-surface-variant">{t('emptyHint')}</LabelCaps>
              </Surface>
            }
            refreshControl={
              <RefreshControl
                refreshing={query.isRefetching && !query.isFetchingNextPage}
                onRefresh={() => query.refetch()}
                tintColor={tokens.colors.primary}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <View className="py-[16px]">
                  <ActivityIndicator color={tokens.colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </Surface>
  );
}
