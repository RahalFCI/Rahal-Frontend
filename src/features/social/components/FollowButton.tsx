/**
 * FollowButton — follow/unfollow toggle. Following state is derived by the caller
 * (the backend has no isFollowedByMe today). Follow uses the amber BeaconButton
 * accent; Following is a quiet outlined state.
 */
import { Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { tokens } from '../../../shared/theme';

export interface FollowButtonProps {
  following: boolean;
  pending?: boolean;
  onPress: () => void;
}

export function FollowButton({ following, pending, onPress }: FollowButtonProps) {
  const { t } = useTranslation('social');
  return (
    <Pressable
      onPress={onPress}
      disabled={pending}
      accessibilityRole="button"
      className={`px-[22px] py-[9px] rounded-full items-center justify-center ${
        following ? 'bg-surface-container-low' : 'bg-primary'
      }`}
    >
      {pending ? (
        <ActivityIndicator
          size="small"
          color={following ? tokens.colors.onSurfaceVariant : tokens.colors.onPrimary}
        />
      ) : (
        <Text
          variant="labelMedium"
          className={following ? 'text-on-surface-variant font-bold' : 'font-bold'}
          style={following ? undefined : { color: tokens.colors.onPrimary }}
        >
          {following ? t('user.unfollow') : t('user.follow')}
        </Text>
      )}
    </Pressable>
  );
}
