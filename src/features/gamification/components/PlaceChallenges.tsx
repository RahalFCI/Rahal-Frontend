/**
 * PlaceChallenges — challenge templates tied to a place, with the live attempt flow.
 *
 * A challenge attempt is gated behind a completed check-in at the place (the backend
 * links the attempt to a check-in id). Each card derives its state from the explorer's
 * check-in + prior attempts: check in first → attempt → in review (Pending) → completed
 * (Approved). Submitting proof happens in `ChallengeAttemptSheet`.
 */
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Camera, CheckCircle2, Clock, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Icon, LabelCaps, Text } from '../../../shared/components';
import { RelicCard } from '../../../shared/layout';
import { useTheme } from '../../../shared/theme';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfile } from '../../auth/hooks/useProfile';
import { levelFromXp } from '../../../shared/gamification/leveling';
import { usePlaceChallenges } from '../hooks/usePlaceChallenges';
import { useCheckInForPlace } from '../hooks/useCheckInForPlace';
import { useCheckInChallenges } from '../hooks/useCheckInChallenges';
import { ChallengeAttemptSheet } from './ChallengeAttemptSheet';
import type { Challenge, CheckInChallenge } from '../api/schemas';

interface PlaceChallengesProps {
  placeId: string;
}

function meta(challenge: Challenge): string {
  return [challenge.difficulty, challenge.type]
    .map((value) => value?.trim())
    .filter((value): value is string => !!value)
    .join(' / ');
}

export function PlaceChallenges({ placeId }: PlaceChallengesProps) {
  const theme = useTheme();
  const { t } = useTranslation('places');
  const userId = useAuthStore((s) => s.user?.id);

  const { data: challenges = [], isLoading, isError } = usePlaceChallenges(placeId);
  const { data: checkIn } = useCheckInForPlace(placeId);
  const checkInId = checkIn?.checkInId ?? null;
  const { data: attempts = [] } = useCheckInChallenges(checkInId);
  const { data: profile } = useProfile(userId);
  const currentLevel = levelFromXp(profile?.cumulativeXp ?? 0).level;

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  const attemptFor = (challengeId: string): CheckInChallenge | undefined =>
    attempts.find((a) => a.challengeId === challengeId);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <Text variant="bodyMedium" className="text-on-surface-variant">
        {t('challenges.unavailable')}
      </Text>
    );
  }

  if (challenges.length === 0) {
    return (
      <Text variant="bodyMedium" className="text-on-surface-variant">
        {t('challenges.empty')}
      </Text>
    );
  }

  return (
    <View style={styles.stack}>
      {challenges.map((challenge) => {
        const details = meta(challenge);
        const attempt = attemptFor(challenge.id);
        const status = attempt?.validationStatus;
        const isApproved = status === 'Approved';
        const isPending = status === 'Pending';
        const minLevel = challenge.minimumLevelRequired ?? 0;
        const underLevel = minLevel > 0 && currentLevel < minLevel;

        return (
          <RelicCard key={challenge.id} style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon icon={Camera} size={20} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.body}>
                <Text variant="bodyLarge" className="font-bold" numberOfLines={2}>
                  {challenge.name}
                </Text>
                {details ? (
                  <LabelCaps className="text-primary mt-[4px]" numberOfLines={1}>
                    {details}
                  </LabelCaps>
                ) : null}
              </View>
            </View>

            {challenge.description ? (
              <Text variant="bodyMedium" className="text-on-surface-variant" numberOfLines={3}>
                {challenge.description}
              </Text>
            ) : null}

            {challenge.validationPrompt ? (
              <Text variant="bodyMedium" className="text-on-surface-variant" numberOfLines={2}>
                {challenge.validationPrompt}
              </Text>
            ) : null}

            {underLevel && !isApproved ? (
              <LabelCaps className="text-on-surface-variant">
                {t('challenges.levelRecommended', { level: minLevel })}
              </LabelCaps>
            ) : null}

            <View style={styles.footer}>
              <LabelCaps className="text-on-surface-variant">
                {t('challenges.xpReward', { xp: challenge.xpReward ?? 0 })}
              </LabelCaps>

              {isApproved ? (
                <View style={styles.statusBadge}>
                  <Icon icon={CheckCircle2} size={15} color={theme.colors.primary} />
                  <Text variant="labelSmall" className="text-primary font-bold">
                    {t('challenges.completed')}
                  </Text>
                </View>
              ) : isPending ? (
                <View style={styles.statusBadge}>
                  <Icon icon={Clock} size={15} color={theme.colors.onSurfaceVariant} />
                  <Text variant="labelSmall" className="text-on-surface-variant font-bold">
                    {t('challenges.inReview')}
                  </Text>
                </View>
              ) : !checkInId ? (
                <View
                  style={[styles.hintBadge, { backgroundColor: theme.colors.surfaceContainerHigh }]}
                >
                  <Icon icon={MapPin} size={15} color={theme.colors.onSurfaceVariant} />
                  <Text variant="labelSmall" className="text-on-surface-variant font-bold">
                    {t('challenges.checkInFirst')}
                  </Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('challenges.attempt')}
                  onPress={() => setActiveChallenge(challenge)}
                  style={[styles.attemptButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Icon icon={Camera} size={15} color={theme.colors.onPrimary} />
                  <Text
                    variant="labelSmall"
                    className="font-bold"
                    style={{ color: theme.colors.onPrimary }}
                  >
                    {t('challenges.attempt')}
                  </Text>
                </Pressable>
              )}
            </View>
          </RelicCard>
        );
      })}

      {activeChallenge && checkInId ? (
        <ChallengeAttemptSheet
          visible
          challenge={activeChallenge}
          checkInId={checkInId}
          existingAttemptId={attemptFor(activeChallenge.id)?.id ?? null}
          onClose={() => setActiveChallenge(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  stack: {
    gap: 12,
  },
  card: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintBadge: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  attemptButton: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
