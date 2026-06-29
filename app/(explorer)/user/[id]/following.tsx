/**
 * Following list for a user.
 */
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFollowees } from '../../../../src/features/social/hooks/useSocialUser';
import { ConnectionList } from '../../../../src/features/social/components/ConnectionList';

export default function FollowingScreen() {
  const { t } = useTranslation('social');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useFollowees(id);

  return (
    <ConnectionList
      title={t('user.following')}
      emptyLabel={t('user.followingEmpty')}
      users={data}
      isLoading={isLoading}
    />
  );
}
