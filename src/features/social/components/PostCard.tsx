/**
 * PostCard — a post in the feed / profile, on surface-container-lowest (RelicCard
 * tone). Editorial, not arcade (CLAUDE.md §3.2): the liked state is a quiet amber
 * fill, not a burst. Like is optimistic via useToggleLike.
 */
import { View, Pressable } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import { Avatar } from './Avatar';
import { PostMedia } from './PostMedia';
import { relativeTime, formatCount } from '../utils/format';
import { useToggleLike } from '../hooks/useToggleLike';
import type { Post } from '../api/schemas';

export interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
}

export function PostCard({ post, onPress, onAuthorPress }: PostCardProps) {
  const toggleLike = useToggleLike();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="bg-surface-container-lowest rounded-lg p-[16px] gap-[12px]"
      style={{
        shadowColor: tokens.colors.onSurface,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
      }}
    >
      {/* Author row */}
      <View className="flex-row items-center gap-[12px]">
        <Pressable onPress={onAuthorPress} accessibilityRole="button">
          <Avatar name={post.authorName} size={40} />
        </Pressable>
        <View className="flex-1">
          <Pressable onPress={onAuthorPress}>
            <Text variant="bodyLarge" className="font-bold text-on-surface">
              {post.authorName ?? 'Explorer'}
            </Text>
          </Pressable>
        </View>
        <LabelCaps className="text-on-surface-variant">{relativeTime(post.createdAt)}</LabelCaps>
      </View>

      {/* Body */}
      {post.content ? (
        <Text variant="bodyMedium" className="text-on-surface">
          {post.content}
        </Text>
      ) : null}

      <PostMedia urls={post.mediaUrls} />

      {/* Actions */}
      <View className="flex-row items-center gap-[24px] pt-[4px]">
        <Pressable
          onPress={() => toggleLike.mutate({ postId: post.id, liked: post.isLikedByThisUser })}
          accessibilityRole="button"
          accessibilityLabel="like"
          className="flex-row items-center gap-[6px]"
        >
          <Heart
            size={20}
            color={post.isLikedByThisUser ? tokens.colors.primary : tokens.colors.onSurfaceVariant}
            fill={post.isLikedByThisUser ? tokens.colors.primary : 'transparent'}
            strokeWidth={1.5}
          />
          <LabelCaps
            className={post.isLikedByThisUser ? 'text-primary' : 'text-on-surface-variant'}
          >
            {formatCount(post.likesCount)}
          </LabelCaps>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="comments"
          className="flex-row items-center gap-[6px]"
        >
          <MessageCircle size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
          <LabelCaps className="text-on-surface-variant">
            {formatCount(post.commentsCount)}
          </LabelCaps>
        </Pressable>
      </View>
    </Pressable>
  );
}
