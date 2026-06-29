/**
 * ConnectionList — shared body for the followers / following screens. Renders a
 * cataloged list of users with a follow toggle (follow state derived from the
 * caller's followees), and routes to each user's profile.
 */
import { useMemo } from 'react';
import { View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../../shared/components/Surface';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { OffsetHeadline } from '../../../shared/layout/OffsetHeadline';
import { tokens } from '../../../shared/theme';
import { useAuthStore } from '../../auth/store/authStore';
import { useFollowees } from '../hooks/useSocialUser';
import { useToggleFollow } from '../hooks/useToggleFollow';
import { UserRow } from './UserRow';
import { FollowButton } from './FollowButton';
import type { SocialUser } from '../api/schemas';

export interface ConnectionListProps {
  title: string;
  emptyLabel: string;
  users: SocialUser[] | undefined;
  isLoading: boolean;
}

export function ConnectionList({ title, emptyLabel, users, isLoading }: ConnectionListProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data: followees } = useFollowees(currentUserId);
  const toggleFollow = useToggleFollow();

  const followingIds = useMemo(() => new Set((followees ?? []).map((u) => u.id)), [followees]);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="flex-row items-center px-[16px] py-[8px]">
          <Pressable onPress={() => router.back()} accessibilityLabel="back" className="p-[4px]">
            <ChevronLeft size={24} color={tokens.colors.onSurface} strokeWidth={2} />
          </Pressable>
        </View>
        <OffsetHeadline title={title} />
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={tokens.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={users ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, paddingHorizontal: 24 }}
            renderItem={({ item }) => {
              const isSelf = item.id === currentUserId;
              const following = followingIds.has(item.id);
              return (
                <UserRow
                  user={item}
                  onPress={() =>
                    router.push({ pathname: '/(explorer)/user/[id]', params: { id: item.id } })
                  }
                  trailing={
                    isSelf ? undefined : (
                      <FollowButton
                        following={following}
                        pending={toggleFollow.isPending}
                        onPress={() => toggleFollow.mutate({ targetUserId: item.id, following })}
                      />
                    )
                  }
                />
              );
            }}
            ListEmptyComponent={
              <LabelCaps className="text-on-surface-variant px-[4px]">{emptyLabel}</LabelCaps>
            }
          />
        )}
      </SafeAreaView>
    </Surface>
  );
}
