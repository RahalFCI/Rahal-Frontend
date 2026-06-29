/**
 * UserRow — a cataloged person in a list (discover, followers, following). Composes
 * Avatar + name + follower count, with an optional trailing slot (e.g. FollowButton).
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { Avatar } from './Avatar';
import { formatCount } from '../utils/format';
import type { SocialUser } from '../api/schemas';

export interface UserRowProps {
  user: SocialUser;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

export function UserRow({ user, onPress, trailing }: UserRowProps) {
  const { t } = useTranslation('social');
  const body = (
    <View className="flex-row items-center gap-[12px] py-[10px]">
      <Avatar name={user.name} size={40} />
      <View className="flex-1">
        <Text variant="bodyLarge" className="font-bold text-on-surface">
          {user.name ?? t('user.unknown')}
        </Text>
        <LabelCaps className="text-on-surface-variant mt-[2px]">
          {t('user.followersCount', { count: user.followersCount, value: formatCount(user.followersCount) })}
        </LabelCaps>
      </View>
      {trailing}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={user.name ?? ''}>
      {body}
    </Pressable>
  );
}
