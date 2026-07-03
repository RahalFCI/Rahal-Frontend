/**
 * NotificationBell — a bell icon button with an unread-count badge, opening the
 * notifications screen. Lives in the top area of Discover / Social / Profile (there
 * is no shared app header). Editorial treatment: a quiet surface square with a small
 * amber count dot, never an arcade burst (CLAUDE.md §3.2). Reads the polled unread
 * count; when flags.push is off the query is disabled and no badge shows.
 */
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { tokens } from '../../../shared/theme';
import { useUnreadCount } from '../hooks/useUnreadCount';

export interface NotificationBellProps {
  /** Icon glyph size. Default 20. */
  size?: number;
  /** Accessible label (localized by the caller). */
  accessibilityLabel?: string;
}

export function NotificationBell({ size = 20, accessibilityLabel = 'Notifications' }: NotificationBellProps) {
  const router = useRouter();
  const { data: unread } = useUnreadCount();
  const count = unread ?? 0;
  const badge = count > 9 ? '9+' : String(count);

  return (
    <Pressable
      onPress={() => router.push('/(explorer)/notifications')}
      className="p-[8px] rounded-lg bg-surface-container-low"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Bell size={size} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
      {count > 0 ? (
        <View
          className="absolute -top-[3px] -right-[3px] rounded-full items-center justify-center px-[4px]"
          style={{ minWidth: 16, height: 16, backgroundColor: tokens.colors.primary }}
        >
          <Text variant="labelSmall" style={{ color: tokens.colors.onPrimary, fontSize: 10, lineHeight: 14 }}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
