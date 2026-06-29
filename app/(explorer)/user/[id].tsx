/**
 * User profile (other explorers) — header with avatar, name, follower/following
 * counts and a follow toggle, above the user's authored posts (infinite). Follow
 * state is derived from the caller's followees (backend has no isFollowedByMe).
 */
import { useMemo } from 'react';
import { View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { tokens } from '../../../src/shared/theme';
import { useAuthStore } from '../../../src/features/auth/store/authStore';
import { useSocialUser, useFollowees } from '../../../src/features/social/hooks/useSocialUser';
import { useUserPosts } from '../../../src/features/social/hooks/useUserPosts';
import { useToggleFollow } from '../../../src/features/social/hooks/useToggleFollow';
import { flattenPosts } from '../../../src/features/social/utils/postCache';
import { Avatar } from '../../../src/features/social/components/Avatar';
import { FollowButton } from '../../../src/features/social/components/FollowButton';
import { PostCard } from '../../../src/features/social/components/PostCard';
import { formatCount } from '../../../src/features/social/utils/format';

export default function UserProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation('social');
  const { id } = useLocalSearchParams<{ id: string }>();
  const targetId = id ?? '';
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isSelf = currentUserId === targetId;

  const user = useSocialUser(targetId);
  const userPosts = useUserPosts(targetId);
  const { data: followees } = useFollowees(currentUserId);
  const toggleFollow = useToggleFollow();

  const posts = useMemo(() => flattenPosts(userPosts.data), [userPosts.data]);
  const following = useMemo(
    () => (followees ?? []).some((u) => u.id === targetId),
    [followees, targetId],
  );

  const Stat = ({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) => (
    <Pressable onPress={onPress} className="items-center px-[12px]" accessibilityRole="button">
      <Text variant="headlineSmall" className="text-on-surface">
        {formatCount(value)}
      </Text>
      <LabelCaps className="text-on-surface-variant mt-[2px]">{label}</LabelCaps>
    </Pressable>
  );

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="flex-row items-center px-[16px] py-[8px]">
          <Pressable onPress={() => router.back()} accessibilityLabel="back" className="p-[4px]">
            <ChevronLeft size={24} color={tokens.colors.onSurface} strokeWidth={2} />
          </Pressable>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="pb-[16px] gap-[16px]">
              <View className="flex-row items-center gap-[16px]">
                <Avatar name={user.data?.name} size={64} />
                <View className="flex-1">
                  <Text variant="headlineSmall" className="text-on-surface">
                    {user.data?.name ?? t('user.unknown')}
                  </Text>
                </View>
                {!isSelf ? (
                  <FollowButton
                    following={following}
                    pending={toggleFollow.isPending}
                    onPress={() => toggleFollow.mutate({ targetUserId: targetId, following })}
                  />
                ) : null}
              </View>

              <View className="flex-row">
                <Stat
                  value={user.data?.followersCount ?? 0}
                  label={t('user.followers')}
                  onPress={() =>
                    router.push({ pathname: '/(explorer)/user/[id]/followers', params: { id: targetId } })
                  }
                />
                <Stat
                  value={user.data?.followingCount ?? 0}
                  label={t('user.following')}
                  onPress={() =>
                    router.push({ pathname: '/(explorer)/user/[id]/following', params: { id: targetId } })
                  }
                />
              </View>

              <Text variant="headlineSmall" className="text-on-surface mt-[8px]">
                {t('user.posts')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() =>
                router.push({ pathname: '/(explorer)/social/[id]', params: { id: item.id } })
              }
            />
          )}
          ListEmptyComponent={
            userPosts.isLoading ? (
              <ActivityIndicator color={tokens.colors.primary} />
            ) : (
              <LabelCaps className="text-on-surface-variant">{t('user.noPosts')}</LabelCaps>
            )
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (userPosts.hasNextPage && !userPosts.isFetchingNextPage) userPosts.fetchNextPage();
          }}
          ListFooterComponent={
            userPosts.isFetchingNextPage ? (
              <View className="py-[16px]">
                <ActivityIndicator color={tokens.colors.primary} />
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </Surface>
  );
}
