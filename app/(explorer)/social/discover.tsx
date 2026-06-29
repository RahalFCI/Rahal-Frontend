/**
 * Discover explorers — a cataloged list of social users to follow. The backend list
 * includes the caller (review #10), so we filter self out here.
 */
import { useMemo } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Surface } from '../../../src/shared/components/Surface';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { OffsetHeadline } from '../../../src/shared/layout/OffsetHeadline';
import { tokens } from '../../../src/shared/theme';
import { useAuthStore } from '../../../src/features/auth/store/authStore';
import { useSocialUsers, useFollowees } from '../../../src/features/social/hooks/useSocialUser';
import { useToggleFollow } from '../../../src/features/social/hooks/useToggleFollow';
import { UserRow } from '../../../src/features/social/components/UserRow';
import { FollowButton } from '../../../src/features/social/components/FollowButton';

export default function DiscoverScreen() {
  const router = useRouter();
  const { t } = useTranslation('social');
  const userId = useAuthStore((s) => s.user?.id);

  const { data: users, isLoading } = useSocialUsers();
  const { data: followees } = useFollowees(userId);
  const toggleFollow = useToggleFollow();

  const followingIds = useMemo(() => new Set((followees ?? []).map((u) => u.id)), [followees]);
  const others = useMemo(() => (users ?? []).filter((u) => u.id !== userId), [users, userId]);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="pt-[16px]">
          <OffsetHeadline title={t('user.discoverTitle')} />
        </View>
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={tokens.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={others}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, paddingHorizontal: 24 }}
            renderItem={({ item }) => {
              const following = followingIds.has(item.id);
              return (
                <UserRow
                  user={item}
                  onPress={() =>
                    router.push({ pathname: '/(explorer)/user/[id]', params: { id: item.id } })
                  }
                  trailing={
                    <FollowButton
                      following={following}
                      pending={toggleFollow.isPending}
                      onPress={() => toggleFollow.mutate({ targetUserId: item.id, following })}
                    />
                  }
                />
              );
            }}
            ListEmptyComponent={
              <LabelCaps className="text-on-surface-variant px-[4px]">
                {t('user.discoverEmpty')}
              </LabelCaps>
            }
          />
        )}
      </SafeAreaView>
    </Surface>
  );
}
