/**
 * Rewards screen — placeholder (Phase 4 builds the rewards catalog).
 */
import { useTranslation } from 'react-i18next';
import { Surface } from '../../src/shared/components/Surface';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RewardsScreen() {
  const { t } = useTranslation('rewards');

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1 pt-[16px]">
        <OffsetHeadline title={t('screen.rewards.title')} />
      </SafeAreaView>
    </Surface>
  );
}
