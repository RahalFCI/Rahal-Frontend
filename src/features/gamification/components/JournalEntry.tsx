/**
 * JournalEntry — one row in the journal of exploration (CLAUDE.md §3.2: events
 * read like catalogued entries, not slot-machine payouts). Two variants: a
 * check-in (place + verdict) and an XP gain (source + amount), each with a
 * tracked-out cataloging metadata line.
 */
import { View } from 'react-native';
import { MapPin, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { RelicCard } from '../../../shared/layout/RelicCard';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import { formatCatalogDate, formatXpSource } from '../utils/format';
import type { JournalEntry as Entry } from '../hooks/useJournalFeed';

export function JournalEntry({ entry }: { entry: Entry }) {
  const { t } = useTranslation('gamification');
  const isXp = entry.kind === 'xp';

  const title = isXp
    ? formatXpSource(entry.xp.sourceType)
    : entry.checkIn.placeName?.trim() || t('journal.checkInFallback');

  const date = formatCatalogDate(isXp ? entry.xp.createdAt : entry.checkIn.createdAt);
  const trailing = isXp
    ? `+${entry.xp.amount.toLocaleString()} XP`
    : entry.checkIn.validationStatusName || undefined;
  const meta = [date, trailing].filter(Boolean).join(' • ');

  return (
    <RelicCard className="flex-row items-center gap-[16px]">
      <View
        className={`w-[48px] h-[48px] rounded-sm items-center justify-center ${
          isXp ? 'bg-primary-container/20' : 'bg-surface-container'
        }`}
      >
        {isXp ? (
          <Zap size={20} color={tokens.colors.primary} strokeWidth={2} />
        ) : (
          <MapPin size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
        )}
      </View>

      <View className="flex-1 min-w-0">
        <Text variant="bodyMedium" className="font-bold text-on-surface" numberOfLines={2}>
          {title}
        </Text>
        {meta ? <LabelCaps className="text-on-surface-variant mt-[2px]">{meta}</LabelCaps> : null}
      </View>
    </RelicCard>
  );
}
