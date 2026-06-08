/**
 * Journal screen — placeholder (Phase 3 builds the gamification layer).
 */
import { useTranslation } from 'react-i18next';
import { Surface } from '../../src/shared/components/Surface';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JournalScreen() {
  const { t } = useTranslation('gamification');

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1 pt-[16px]">
        <OffsetHeadline title={t('screen.journal.title')} />
      </SafeAreaView>
    </Surface>
  );
}
