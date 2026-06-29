/**
 * Social feed (Phase 5) — "Field Notes". The signed-in explorer's personalized feed:
 * their own posts + those of people they follow. Infinite scroll, pull to refresh.
 * Editorial treatment per CLAUDE.md §3.2 — a journal, not a timeline arcade.
 */
import { useMemo } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PenLine, Users } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { tokens } from '../../src/shared/theme';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useFeed } from '../../src/features/social/hooks/useFeed';
import { flattenPosts } from '../../src/features/social/utils/postCache';
import { PostCard } from '../../src/features/social/components/PostCard';

export default function SocialScreen() {
  const router = useRouter();
  const { t } = useTranslation('social');
  const userId = useAuthStore((s) => s.user?.id);

  const feed = useFeed(userId);
  const posts = useMemo(() => flattenPosts(feed.data), [feed.data]);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-end justify-between pt-[16px] pr-[16px]">
          <OffsetHeadline title={t('feed.title')} />
          <Pressable
            onPress={() => router.push('/(explorer)/social/discover')}
            className="flex-row items-center gap-[6px] p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('feed.discover')}
          >
            <Users size={18} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        {feed.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={tokens.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 120, paddingHorizontal: 24, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onPress={() =>
                  router.push({ pathname: '/(explorer)/social/[id]', params: { id: item.id } })
                }
                onAuthorPress={() =>
                  router.push({ pathname: '/(explorer)/user/[id]', params: { id: item.authorId } })
                }
              />
            )}
            ListEmptyComponent={
              <Surface tone="lowest" className="mt-[8px] p-[24px] rounded-lg gap-[8px]">
                <Text variant="bodyLarge" className="font-bold text-on-surface">
                  {t('feed.empty')}
                </Text>
                <LabelCaps className="text-on-surface-variant">{t('feed.emptyHint')}</LabelCaps>
              </Surface>
            }
            refreshControl={
              <RefreshControl
                refreshing={feed.isRefetching && !feed.isFetchingNextPage}
                onRefresh={() => feed.refetch()}
                tintColor={tokens.colors.primary}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
            }}
            ListFooterComponent={
              feed.isFetchingNextPage ? (
                <View className="py-[16px]">
                  <ActivityIndicator color={tokens.colors.primary} />
                </View>
              ) : null
            }
          />
        )}

        {/* Compose FAB */}
        <Pressable
          onPress={() => router.push('/(explorer)/social/compose')}
          accessibilityLabel={t('post.submit')}
          className="absolute bottom-[100px] right-[24px] w-[56px] h-[56px] rounded-full bg-primary items-center justify-center"
          style={{
            shadowColor: tokens.colors.onSurface,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <PenLine size={24} color={tokens.colors.onPrimary} strokeWidth={2} />
        </Pressable>
      </SafeAreaView>
    </Surface>
  );
}
