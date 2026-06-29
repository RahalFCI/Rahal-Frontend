/**
 * Followers list for a user.
 */
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFollowers } from '../../../../src/features/social/hooks/useSocialUser';
import { ConnectionList } from '../../../../src/features/social/components/ConnectionList';

export default function FollowersScreen() {
  const { t } = useTranslation('social');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useFollowers(id);

  return (
    <ConnectionList
      title={t('user.followers')}
      emptyLabel={t('user.followersEmpty')}
      users={data}
      isLoading={isLoading}
    />
  );
}
