/**
 * NotificationRow — a single cataloged notification. Editorial treatment: a quiet
 * type glyph, the server-rendered message, and a LabelCaps time. Unread rows carry a
 * soft tonal emphasis and an amber dot; tapping marks the row read (optimistically)
 * and deep-links per its type/target.
 */
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, UserPlus, Newspaper, Bell } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import { NotificationType, type Notification } from '../api/schemas';
import { relativeTime } from '../utils/format';
import { routeForNotification } from '../utils/route';
import { useMarkRead } from '../hooks/useMarkRead';

function iconFor(type: string) {
  switch (type) {
    case NotificationType.PostLike:
      return Heart;
    case NotificationType.PostComment:
      return MessageCircle;
    case NotificationType.Follow:
      return UserPlus;
    case NotificationType.NewPost:
      return Newspaper;
    default:
      return Bell;
  }
}

export function NotificationRow({ notification }: { notification: Notification }) {
  const router = useRouter();
  const markRead = useMarkRead();
  const Icon = iconFor(notification.type);
  const unread = !notification.isRead;

  const onPress = () => {
    if (unread) markRead.mutate({ id: notification.id, wasUnread: true });
    const path = routeForNotification(notification.type, notification.targetId);
    if (path) router.push(path as never);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center gap-[14px] px-[20px] py-[16px] ${
        unread ? 'bg-surface-container-low' : 'bg-surface'
      }`}
    >
      <View
        className="w-[40px] h-[40px] rounded-full items-center justify-center"
        style={{
          backgroundColor: unread ? tokens.colors.primaryContainer : tokens.colors.surfaceContainer,
        }}
      >
        <Icon
          size={18}
          color={unread ? tokens.colors.primary : tokens.colors.onSurfaceVariant}
          strokeWidth={2}
        />
      </View>

      <View className="flex-1">
        <Text
          variant="bodyMedium"
          className={unread ? 'text-on-surface font-medium' : 'text-on-surface-variant'}
        >
          {notification.message}
        </Text>
        <LabelCaps className="text-on-surface-variant mt-[3px]">
          {relativeTime(notification.createdAt)}
        </LabelCaps>
      </View>

      {unread ? (
        <View
          className="w-[8px] h-[8px] rounded-full"
          style={{ backgroundColor: tokens.colors.primary }}
        />
      ) : null}
    </Pressable>
  );
}
