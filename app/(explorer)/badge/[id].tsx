/**
 * Badge detail — a framed archival card for a single badge (CLAUDE.md §3.2:
 * cataloged, not celebrated). Shows the cataloging date for earned badges and a
 * lock state otherwise. Reads from the badge entries already in cache.
 */
import { View, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Lock, Trophy } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { useAuthStore } from '../../../src/features/auth/store/authStore';
import { useEarnedBadges } from '../../../src/features/gamification/hooks/useEarnedBadges';
import { formatCatalogDate } from '../../../src/features/gamification/utils/format';
import { resolveMediaUrl } from '../../../src/shared/utils/mediaUrl';
import { tokens } from '../../../src/shared/theme';

export default function BadgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('gamification');
  const userId = useAuthStore((s) => s.user?.id);
  const { entries, isLoading } = useEarnedBadges(userId);

  const entry = entries.find((e) => e.badge.id === id);
  const imageUrl = resolveMediaUrl(entry?.badge.imageUrl);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-[16px] py-[12px]">
          <Pressable
            onPress={() => router.back()}
            className="p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('common.back')}
          >
            <ChevronLeft size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="items-center py-[48px]">
            <ActivityIndicator color={tokens.colors.primary} size="large" />
          </View>
        ) : !entry ? (
          <View className="items-center py-[48px] px-[24px]">
            <Text variant="bodyLarge" className="text-on-surface-variant text-center">
              {t('badges.notFound')}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerClassName="px-[24px] pt-[16px] pb-[40px] gap-[24px]">
            {/* Framed archival emblem */}
            <View className="items-center">
              <View
                className={`w-[160px] h-[160px] rounded-xl items-center justify-center overflow-hidden ${
                  entry.earned ? 'bg-primary-container/20' : 'bg-surface-container opacity-60'
                }`}
                style={{
                  shadowColor: tokens.colors.onSurface,
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.12,
                  shadowRadius: 25,
                  elevation: 8,
                }}
              >
                {imageUrl && entry.earned ? (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                ) : entry.earned ? (
                  <Trophy size={64} color={tokens.colors.primary} strokeWidth={1.5} />
                ) : (
                  <Lock size={56} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
                )}
              </View>
            </View>

            <View className="items-center gap-[8px]">
              <Text variant="displaySmall" className="font-bold text-on-surface text-center">
                {entry.badge.name}
              </Text>
              <LabelCaps className={entry.earned ? 'text-primary' : 'text-on-surface-variant'}>
                {entry.earned
                  ? `${t('badges.cataloged')} • ${formatCatalogDate(entry.awardedAt) || t('badges.earned')}`
                  : t('badges.locked')}
              </LabelCaps>
            </View>

            {entry.badge.description ? (
              <Surface tone="lowest" className="p-[24px] rounded-lg">
                <Text variant="bodyLarge" className="text-on-surface-variant">
                  {entry.badge.description}
                </Text>
              </Surface>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </Surface>
  );
}
