/**
 * CommentRow — a single comment with author, time, content and actions. Own comments
 * can be edited inline / deleted. Replies expand inline (one extra indent level) via
 * useReplies. Replying is delegated up to the screen's composer via onReply so there's
 * a single input focus target.
 */
import { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { Avatar } from './Avatar';
import { CommentComposer } from './CommentComposer';
import { relativeTime } from '../utils/format';
import { useReplies } from '../hooks/useComments';
import { useEditComment, useDeleteComment } from '../hooks/useCommentMutations';
import type { Comment } from '../api/schemas';

export interface CommentRowProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onReply: (comment: Comment) => void;
  depth?: number;
}

export function CommentRow({ comment, postId, currentUserId, onReply, depth = 0 }: CommentRowProps) {
  const { t } = useTranslation('social');
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const isOwn = !!currentUserId && comment.userId === currentUserId;
  const isDeleted = comment.content === '[Deleted]';

  const replies = useReplies(comment.id, expanded && depth === 0);
  const edit = useEditComment(postId);
  const remove = useDeleteComment(postId);

  const replyItems = (replies.data?.pages ?? []).flatMap((p) => p.comments);

  const confirmDelete = () => {
    Alert.alert(t('comment.deleteConfirmTitle'), t('comment.deleteConfirmBody'), [
      { text: t('comment.deleteConfirmDismiss'), style: 'cancel' },
      {
        text: t('comment.deleteConfirmConfirm'),
        style: 'destructive',
        onPress: () => remove.mutate({ commentId: comment.id, parentCommentId: comment.parentCommentId }),
      },
    ]);
  };

  return (
    <View className={depth > 0 ? 'pl-[40px]' : ''}>
      <View className="flex-row gap-[12px] py-[10px]">
        <Avatar name={comment.userDisplayName} size={32} />
        <View className="flex-1 gap-[2px]">
          <View className="flex-row items-center gap-[8px]">
            <Text variant="labelMedium" className="font-bold text-on-surface">
              {comment.userDisplayName ?? t('user.unknown')}
            </Text>
            <LabelCaps className="text-on-surface-variant">
              {relativeTime(comment.createdAt)}
            </LabelCaps>
          </View>

          {editing ? (
            <CommentComposer
              initialValue={comment.content}
              pending={edit.isPending}
              onCancel={() => setEditing(false)}
              onSubmit={(content) =>
                edit.mutate(
                  { commentId: comment.id, content, parentCommentId: comment.parentCommentId },
                  { onSuccess: () => setEditing(false) },
                )
              }
            />
          ) : (
            <Text
              variant="bodyMedium"
              className={isDeleted ? 'text-on-surface-variant italic' : 'text-on-surface'}
            >
              {comment.content}
            </Text>
          )}

          {!editing && !isDeleted ? (
            <View className="flex-row items-center gap-[16px] mt-[2px]">
              <Pressable onPress={() => onReply(comment)} accessibilityRole="button">
                <LabelCaps className="text-on-surface-variant">{t('comment.reply')}</LabelCaps>
              </Pressable>
              {isOwn ? (
                <>
                  <Pressable onPress={() => setEditing(true)} accessibilityRole="button">
                    <LabelCaps className="text-on-surface-variant">{t('comment.edit')}</LabelCaps>
                  </Pressable>
                  <Pressable onPress={confirmDelete} accessibilityRole="button">
                    <LabelCaps className="text-on-surface-variant">{t('comment.delete')}</LabelCaps>
                  </Pressable>
                </>
              ) : null}
            </View>
          ) : null}

          {comment.repliesCount > 0 && depth === 0 ? (
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              accessibilityRole="button"
              className="mt-[4px]"
            >
              <LabelCaps className="text-primary">
                {expanded
                  ? t('comment.hideReplies')
                  : t('comment.viewReplies', { count: comment.repliesCount })}
              </LabelCaps>
            </Pressable>
          ) : null}
        </View>
      </View>

      {expanded && depth === 0
        ? replyItems.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onReply={onReply}
              depth={1}
            />
          ))
        : null}
    </View>
  );
}
