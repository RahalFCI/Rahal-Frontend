/**
 * Journal screen — the editorial "journal of exploration": the explorer's
 * check-ins and XP gains merged into one timeline, newest first (Phase 3).
 */
import { View, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { OffsetHeadline } from '../../src/shared/layout/OffsetHeadline';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useJournalFeed } from '../../src/features/gamification/hooks/useJournalFeed';
import { JournalEntry } from '../../src/features/gamification/components/JournalEntry';
import { tokens } from '../../src/shared/theme';

/** Tonal placeholder rows while the feed loads (no shimmer — CLAUDE.md §7). */
function JournalSkeleton() {
  return (
    <View className="px-[24px] pt-[24px] gap-[16px]">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="h-[80px] rounded-lg bg-surface-container-low opacity-60" />
      ))}
    </View>
  );
}

export default function JournalScreen() {
  const { t } = useTranslation('gamification');
  const userId = useAuthStore((s) => s.user?.id);
  const { entries, isLoading, isError, refetch } = useJournalFeed(userId);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1 pt-[16px]">
        <OffsetHeadline title={t('screen.journal.title')} />

        {isLoading ? (
          <JournalSkeleton />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <JournalEntry entry={item} />}
            contentContainerClassName="px-[24px] pt-[24px] pb-[32px] gap-[16px]"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={refetch}
                tintColor={tokens.colors.primary}
              />
            }
            ListEmptyComponent={
              <Surface tone="lowest" className="p-[24px] rounded-lg mt-[8px]">
                <Text variant="bodyLarge" className="text-on-surface font-bold">
                  {t(isError ? 'journal.errorTitle' : 'journal.emptyTitle')}
                </Text>
                <LabelCaps className="text-on-surface-variant mt-[8px]">
                  {t(isError ? 'journal.errorBody' : 'journal.emptyBody')}
                </LabelCaps>
              </Surface>
            }
          />
        )}
      </SafeAreaView>
    </Surface>
  );
}
