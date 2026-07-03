/**
 * PostCard — a post in the feed / profile. "Warm editorial magazine" treatment:
 * a ringed avatar, a name + time subline, generous body type, softly-rounded media,
 * and pill-shaped action buttons that fill amber when active. Still editorial, not
 * arcade (CLAUDE.md §3.2): the liked state is a warm amber pill, never a burst.
 * Like is optimistic via useToggleLike.
 */
import { View, Pressable } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
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
  const liked = post.isLikedByThisUser;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="bg-surface-container-lowest rounded-xl p-[20px] gap-[14px]"
      style={{
        shadowColor: tokens.colors.onSurface,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
        elevation: 2,
      }}
    >
      {/* Author row — ringed avatar + name over a quiet time subline */}
      <View className="flex-row items-center gap-[12px]">
        <Pressable onPress={onAuthorPress} accessibilityRole="button">
          <Avatar name={post.authorName} size={44} ring />
        </Pressable>
        <Pressable onPress={onAuthorPress} className="flex-1">
          <Text variant="bodyLarge" className="font-bold text-on-surface">
            {post.authorName ?? 'Explorer'}
          </Text>
          <Text variant="labelMedium" className="text-on-surface-variant mt-[1px]">
            {relativeTime(post.createdAt)}
          </Text>
        </Pressable>
      </View>

      {/* Body — larger, friendlier reading size */}
      {post.content ? (
        <Text variant="bodyLarge" className="text-on-surface">
          {post.content}
        </Text>
      ) : null}

      <PostMedia urls={post.mediaUrls} />

      {/* Actions — pill buttons; liked fills amber */}
      <View className="flex-row items-center gap-[10px] pt-[2px]">
        <Pressable
          onPress={() => toggleLike.mutate({ postId: post.id, liked })}
          accessibilityRole="button"
          accessibilityLabel="like"
          className={`flex-row items-center gap-[7px] pl-[12px] pr-[14px] py-[7px] rounded-full ${
            liked ? 'bg-primary-container/60' : 'bg-surface-container-low'
          }`}
        >
          <Heart
            size={18}
            color={liked ? tokens.colors.primary : tokens.colors.onSurfaceVariant}
            fill={liked ? tokens.colors.primary : 'transparent'}
            strokeWidth={2}
          />
          <Text
            variant="labelMedium"
            className={liked ? 'text-primary font-bold' : 'text-on-surface-variant font-bold'}
          >
            {formatCount(post.likesCount)}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="comments"
          className="flex-row items-center gap-[7px] pl-[12px] pr-[14px] py-[7px] rounded-full bg-surface-container-low"
        >
          <MessageCircle size={18} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          <Text variant="labelMedium" className="text-on-surface-variant font-bold">
            {formatCount(post.commentsCount)}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
