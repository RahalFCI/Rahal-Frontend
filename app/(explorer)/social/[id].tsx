/**
 * Post detail — the post + its comment thread. Root comments paginate (newest-first);
 * each can expand its replies inline. A single bottom composer posts a root comment,
 * or a reply when a comment's "Reply" is tapped (shown via a "replying to" banner).
 * The post author can delete their own post from the header.
 */
import { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { tokens } from '../../../src/shared/theme';
import { useAuthStore } from '../../../src/features/auth/store/authStore';
import { usePost } from '../../../src/features/social/hooks/usePost';
import { useComments } from '../../../src/features/social/hooks/useComments';
import { useCreateComment } from '../../../src/features/social/hooks/useCommentMutations';
import { useDeletePost } from '../../../src/features/social/hooks/useDeletePost';
import { PostCard } from '../../../src/features/social/components/PostCard';
import { CommentRow } from '../../../src/features/social/components/CommentRow';
import { CommentComposer } from '../../../src/features/social/components/CommentComposer';
import type { Comment } from '../../../src/features/social/api/schemas';

export default function PostDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation('social');
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = id ?? '';
  const currentUserId = useAuthStore((s) => s.user?.id);

  const post = usePost(postId);
  const comments = useComments(postId);
  const createComment = useCreateComment(postId);
  const deletePost = useDeletePost();

  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);

  const rootComments = useMemo(
    () => (comments.data?.pages ?? []).flatMap((p) => p.comments),
    [comments.data],
  );

  const isOwnPost = !!currentUserId && post.data?.authorId === currentUserId;

  const confirmDelete = () => {
    Alert.alert(t('post.deleteConfirmTitle'), t('post.deleteConfirmBody'), [
      { text: t('post.deleteConfirmDismiss'), style: 'cancel' },
      {
        text: t('post.deleteConfirmConfirm'),
        style: 'destructive',
        onPress: () => deletePost.mutate({ postId }, { onSuccess: () => router.back() }),
      },
    ]);
  };

  const submitComment = (content: string) => {
    createComment.mutate(
      { content, parentCommentId: replyTarget?.id ?? null },
      { onSuccess: () => setReplyTarget(null) },
    );
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-[16px] py-[8px]">
          <Pressable onPress={() => router.back()} accessibilityLabel="back" className="p-[4px]">
            <ChevronLeft size={24} color={tokens.colors.onSurface} strokeWidth={2} />
          </Pressable>
          <Text variant="labelMedium" className="text-on-surface-variant uppercase">
            {t('post.detailTitle')}
          </Text>
          {isOwnPost ? (
            <Pressable onPress={confirmDelete} accessibilityLabel={t('post.menuDelete')} className="p-[4px]">
              <Trash2 size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
            </Pressable>
          ) : (
            <View className="w-[28px]" />
          )}
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}
        >
          {post.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={tokens.colors.primary} />
            </View>
          ) : !post.data ? (
            <View className="flex-1 items-center justify-center px-[24px]">
              <LabelCaps className="text-on-surface-variant">{t('error.notFound')}</LabelCaps>
            </View>
          ) : (
            <FlatList
              data={rootComments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 4 }}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View className="pt-[8px] gap-[16px]">
                  <PostCard
                    post={post.data}
                    onAuthorPress={() =>
                      router.push({
                        pathname: '/(explorer)/user/[id]',
                        params: { id: post.data!.authorId },
                      })
                    }
                  />
                  <Text variant="headlineSmall" className="text-on-surface">
                    {t('comment.sectionTitle')}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <CommentRow
                  comment={item}
                  postId={postId}
                  currentUserId={currentUserId}
                  onReply={setReplyTarget}
                />
              )}
              ListEmptyComponent={
                comments.isLoading ? (
                  <ActivityIndicator color={tokens.colors.primary} className="mt-[16px]" />
                ) : (
                  <LabelCaps className="text-on-surface-variant mt-[8px]">
                    {t('comment.empty')}
                  </LabelCaps>
                )
              }
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (comments.hasNextPage && !comments.isFetchingNextPage) comments.fetchNextPage();
              }}
              ListFooterComponent={
                comments.isFetchingNextPage ? (
                  <View className="py-[16px]">
                    <ActivityIndicator color={tokens.colors.primary} />
                  </View>
                ) : null
              }
            />
          )}

          {/* Composer */}
          <View className="px-[24px] pt-[8px] pb-[12px] gap-[6px] border-t border-outline-variant/40 bg-surface">
            {replyTarget ? (
              <View className="flex-row items-center justify-between">
                <LabelCaps className="text-primary">
                  {t('comment.replyingTo', { name: replyTarget.userDisplayName ?? t('user.unknown') })}
                </LabelCaps>
                <Pressable onPress={() => setReplyTarget(null)} accessibilityLabel={t('comment.cancel')}>
                  <LabelCaps className="text-on-surface-variant">{t('comment.cancel')}</LabelCaps>
                </Pressable>
              </View>
            ) : null}
            <CommentComposer
              onSubmit={submitComment}
              pending={createComment.isPending}
              placeholder={replyTarget ? t('comment.replyPlaceholder') : t('comment.placeholder')}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Surface>
  );
}
