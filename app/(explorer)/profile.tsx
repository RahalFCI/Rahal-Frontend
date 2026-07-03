/**
 * Profile screen — Explorer identity, gamification summary, and activity feed.
 * Figma: node 1:799. All data is now live: identity from ExplorerProfile, XP/level
 * derived from cumulative XP (CLAUDE.md §9 — backend has no XP→Level logic), stats
 * from UserStats, badges from the catalog joined with earned achievements, and the
 * recent-activity strip from the shared journal feed.
 *
 * Design deviations from Figma (design.md rules applied):
 * - Badge card borders removed (No-Line Rule); tonal bg shift used instead.
 * - Top bar separator line removed; tonal backdrop is enough.
 * - Locked badge desaturation via opacity-60 + surfaceContainerLow (RN platform limit).
 */
import { View, ScrollView, Pressable, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LogOut, Star, Zap, MapPin, ChevronRight, Pencil } from 'lucide-react-native';
import { NotificationBell } from '../../src/features/notifications/components/NotificationBell';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { useSignOut } from '../../src/features/auth/hooks/useSignOut';
import { useEarnedBadges, type BadgeEntry } from '../../src/features/gamification/hooks/useEarnedBadges';
import { useJournalFeed, type JournalEntry } from '../../src/features/gamification/hooks/useJournalFeed';
import { BadgeCard } from '../../src/features/gamification/components/BadgeCard';
import { formatCatalogDate, formatXpSource } from '../../src/features/gamification/utils/format';
import { levelFromXp } from '../../src/shared/gamification/leveling';
import { ApiError } from '../../src/shared/api/errors';
import { resolveMediaUrl } from '../../src/shared/utils/mediaUrl';
import { tokens } from '../../src/shared/theme';
import type { ExplorerProfileDto } from '../../src/features/auth/api/authApi';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InitialsAvatar({ name, size = 128 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View
      className="bg-surface-container items-center justify-center rounded-lg overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Text variant="displaySmall" className="text-on-surface-variant font-bold">
        {initials}
      </Text>
    </View>
  );
}

function StatCard({
  value,
  label,
  fullWidth = false,
}: {
  value: string;
  label: string;
  fullWidth?: boolean;
}) {
  return (
    <Surface
      tone="lowest"
      className={`p-[24px] rounded-lg ${fullWidth ? 'w-full' : 'flex-1'}`}
      style={{
        shadowColor: tokens.colors.onSurface,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
      }}
    >
      <Text variant="displaySmall" className="font-bold text-on-surface">
        {value}
      </Text>
      <LabelCaps className="text-on-surface-variant mt-[4px]">{label}</LabelCaps>
    </Surface>
  );
}

function ActivityItem({
  title,
  meta,
  kind,
}: {
  title: string;
  meta: string;
  kind: 'checkin' | 'xp';
}) {
  return (
    <Surface
      tone="lowest"
      className="flex-row items-center gap-[16px] p-[16px] rounded-lg"
      style={{
        shadowColor: tokens.colors.onSurface,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2,
      }}
    >
      <View
        className={`w-[48px] h-[48px] rounded-sm items-center justify-center ${
          kind === 'xp' ? 'bg-primary-container/20' : 'bg-surface-container'
        }`}
      >
        {kind === 'xp' ? (
          <Zap size={20} color={tokens.colors.primary} strokeWidth={2} />
        ) : (
          <MapPin size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
        )}
      </View>

      <View className="flex-1 min-w-0">
        <Text variant="bodyMedium" className="font-bold text-on-surface" numberOfLines={2}>
          {title}
        </Text>
        <LabelCaps className="text-on-surface-variant mt-[2px]">{meta}</LabelCaps>
      </View>

      {kind === 'checkin' ? (
        <Star size={20} color={tokens.colors.primary} fill={tokens.colors.primary} />
      ) : (
        <ChevronRight size={16} color={tokens.colors.onSurfaceVariant} />
      )}
    </Surface>
  );
}

// ---------------------------------------------------------------------------
// Top bar
// ---------------------------------------------------------------------------

function TopBar({
  profile,
  level,
  onLogout,
  onEdit,
  logoutLabel,
  editLabel,
}: {
  profile: ExplorerProfileDto | undefined;
  level: number | null;
  onLogout: () => void;
  onEdit: () => void;
  logoutLabel: string;
  editLabel: string;
}) {
  const user = useAuthStore((s) => s.user);
  const initial = (profile?.name ?? user?.displayName ?? 'E')[0]?.toUpperCase() ?? 'E';
  const levelDisplay = level != null ? `LVL ${level}` : null;
  const avatarUri = resolveMediaUrl(profile?.profilePictureUrl);

  const barContent = (
    <View className="flex-row items-center justify-between px-[24px] py-[12px]">
      {/* Left: thumbnail + app name */}
      <View className="flex-row items-center gap-[12px]">
        <View className="w-[36px] h-[36px] rounded-xl overflow-hidden border-2 border-primary bg-surface-container">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text variant="labelSmall" className="font-bold text-on-surface-variant">
                {initial}
              </Text>
            </View>
          )}
        </View>
        <Text variant="headlineSmall" className="font-bold text-on-surface">
          Rahal
        </Text>
      </View>

      {/* Right: level pill + edit + logout */}
      <View className="flex-row items-center gap-[8px]">
        {levelDisplay && (
          <View className="bg-primary-container/40 px-[10px] py-[3px] rounded-xl">
            <Text variant="labelMedium" className="text-primary font-bold">
              {levelDisplay}
            </Text>
          </View>
        )}
        <NotificationBell size={16} />
        <Pressable
          onPress={onEdit}
          className="p-[8px] rounded-lg bg-surface-container-low"
          accessibilityLabel={editLabel}
        >
          <Pencil size={16} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={onLogout}
          className="p-[8px] rounded-lg bg-surface-container-low"
          accessibilityLabel={logoutLabel}
        >
          <LogOut size={16} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={60} tint="light" className="overflow-hidden">
        {barContent}
      </BlurView>
    );
  }

  return <View className="bg-surface-container-lowest/90">{barContent}</View>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Up to four badges for the profile grid: earned first, then nearest unearned. */
function pickProfileBadges(entries: BadgeEntry[]): BadgeEntry[] {
  const earned = entries.filter((e) => e.earned);
  const unearned = entries.filter((e) => !e.earned);
  return [...earned, ...unearned].slice(0, 4);
}

function activityTitle(entry: JournalEntry, fallbackPlace: string): string {
  if (entry.kind === 'checkin') return entry.checkIn.placeName?.trim() || fallbackPlace;
  return formatXpSource(entry.xp.sourceType);
}

function activityMeta(entry: JournalEntry): string {
  const date = formatCatalogDate(
    entry.kind === 'checkin' ? entry.checkIn.createdAt : entry.xp.createdAt,
  );
  if (entry.kind === 'xp') {
    const xp = `+${entry.xp.amount.toLocaleString()} XP`;
    return date ? `${date} • ${xp}` : xp;
  }
  return date;
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();

  const { data: profile, error, isLoading, isError, refetch } = useProfile(user?.id);
  const isProfileSetupRequired =
    error instanceof ApiError && error.code === 'PROFILE_SETUP_REQUIRED';

  const { entries: badgeEntries } = useEarnedBadges(user?.id);
  const { entries: journalEntries } = useJournalFeed(user?.id);

  // Level + progress derived from cumulative XP (CLAUDE.md §9).
  const cumulativeXp = profile?.cumulativeXp ?? 0;
  const levelInfo = levelFromXp(cumulativeXp);

  const stats = profile?.stats;
  const birthYear = profile?.birthDate ? new Date(profile.birthDate).getFullYear() : null;
  const bioText = profile?.bio || null;

  const profileBadges = pickProfileBadges(badgeEntries);
  const recentActivity = journalEntries.slice(0, 3);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Sticky glass top bar */}
        <TopBar
          profile={profile}
          level={profile ? levelInfo.level : null}
          onLogout={signOut}
          onEdit={() => router.push('/(explorer)/edit-profile')}
          logoutLabel={t('profile.logout')}
          editLabel={t('profile.editProfile')}
        />

        <ScrollView contentContainerClassName="pb-[32px]" showsVerticalScrollIndicator={false}>
          {isLoading && (
            <View className="items-center py-[48px]">
              <ActivityIndicator color={tokens.colors.primary} size="large" />
              <LabelCaps className="text-on-surface-variant mt-[16px]">
                {t('profile.loading')}
              </LabelCaps>
            </View>
          )}

          {isError && !isLoading && isProfileSetupRequired && (
            <View className="items-center py-[56px] px-[24px]">
              <Text variant="headlineSmall" className="font-bold text-on-surface text-center">
                {t('profile.setupTitle')}
              </Text>
              <Text variant="bodyLarge" className="text-on-surface-variant text-center mt-[8px]">
                {t('profile.setupBody')}
              </Text>
              <Pressable
                onPress={() => router.push('/(explorer)/edit-profile')}
                className="mt-[20px] bg-primary rounded-lg px-[18px] py-[12px]"
                accessibilityLabel={t('profile.completeProfile')}
              >
                <Text variant="bodyMedium" className="text-on-primary font-bold">
                  {t('profile.completeProfile')}
                </Text>
              </Pressable>
            </View>
          )}

          {isError && !isLoading && !isProfileSetupRequired && (
            <View className="items-center py-[48px] px-[24px]">
              <Text variant="bodyLarge" className="text-on-surface-variant text-center">
                {t('profile.errorLoad')}
              </Text>
              <Pressable onPress={() => refetch()} className="mt-[16px]">
                <Text variant="bodyMedium" className="text-primary font-bold">
                  {t('profile.retry')}
                </Text>
              </Pressable>
            </View>
          )}

          {!isLoading && !isError && (
            <View className="px-[24px] pt-[32px] gap-[32px]">
              {/* ── Hero ── */}
              <View>
                {/* Profile photo */}
                <View className="mb-[24px]">
                  <View style={{ transform: [{ rotate: '-2deg' }] }} className="w-[128px]">
                    <View
                      className="rounded-lg overflow-hidden w-[128px] h-[128px]"
                      style={{
                        shadowColor: tokens.colors.onSurface,
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.15,
                        shadowRadius: 25,
                        elevation: 8,
                      }}
                    >
                      {resolveMediaUrl(profile?.profilePictureUrl) ? (
                        <Image
                          source={{ uri: resolveMediaUrl(profile?.profilePictureUrl) }}
                          className="w-full h-full"
                          resizeMode="cover"
                          accessibilityIgnoresInvertColors
                        />
                      ) : (
                        <InitialsAvatar name={profile?.name ?? user?.displayName ?? 'Explorer'} />
                      )}
                    </View>
                    {/* Verified / primary badge */}
                    <View
                      className="absolute -bottom-[6px] -right-[6px] w-[40px] h-[40px] bg-primary rounded-xl items-center justify-center"
                      style={{
                        shadowColor: tokens.colors.onSurface,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.1,
                        shadowRadius: 15,
                        elevation: 4,
                      }}
                    >
                      <Star
                        size={18}
                        color={tokens.colors.onPrimary}
                        fill={tokens.colors.onPrimary}
                      />
                    </View>
                  </View>
                </View>

                {/* Name */}
                <View className="pr-[40px]">
                  <Text variant="displaySmall" className="font-bold text-on-surface">
                    {profile?.name ?? user?.displayName ?? '—'}
                  </Text>
                </View>

                {/* Subtitle: bio or role + join year */}
                <View className="mt-[8px]">
                  <LabelCaps className="text-on-surface-variant">
                    {bioText
                      ? bioText.toUpperCase()
                      : `${t('profile.explorer')}${birthYear ? ` • ${t('profile.joined')} ${birthYear}` : ''}`}
                  </LabelCaps>
                </View>

                {/* XP progress bar */}
                {profile && (
                  <View className="mt-[24px] gap-[8px]">
                    <View className="flex-row items-center justify-between">
                      <LabelCaps className="text-on-surface-variant">
                        {t('profile.levelProgress', { level: levelInfo.level })}
                      </LabelCaps>
                      <Text variant="labelSmall" className="text-primary font-bold">
                        {levelInfo.currentLevelXp.toLocaleString()} /{' '}
                        {levelInfo.xpForNextLevel.toLocaleString()} XP
                      </Text>
                    </View>
                    <View className="h-[12px] rounded-xl overflow-hidden bg-surface-container">
                      <View
                        className="h-full rounded-xl bg-primary"
                        style={{ width: `${Math.round(levelInfo.progressPct * 100)}%` }}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* ── Stats bento ── */}
              <View className="gap-[16px]">
                <View className="flex-row gap-[16px]">
                  <StatCard value={cumulativeXp.toLocaleString()} label={t('profile.totalXp')} />
                  <StatCard
                    value={String(stats?.totalCheckIns ?? 0)}
                    label={t('profile.visited')}
                  />
                </View>
                <StatCard
                  value={`${stats?.currentStreak ?? 0} ${t('profile.streakUnit')}`}
                  label={t('profile.streak')}
                  fullWidth
                />
              </View>

              {/* ── Explorer badges ── */}
              <View className="gap-[24px]">
                <View className="flex-row items-center justify-between">
                  <Text variant="headlineSmall" className="font-bold text-on-surface">
                    {t('profile.badges')}
                  </Text>
                  <Pressable onPress={() => router.push('/(explorer)/badges')}>
                    <Text variant="bodyMedium" className="text-primary font-bold">
                      {t('profile.badgeViewAll')}
                    </Text>
                  </Pressable>
                </View>

                {profileBadges.length === 0 ? (
                  <Surface tone="lowest" className="p-[24px] rounded-lg">
                    <LabelCaps className="text-on-surface-variant">
                      {t('gamification:badges.empty')}
                    </LabelCaps>
                  </Surface>
                ) : (
                  <View className="flex-row flex-wrap gap-[16px]">
                    {profileBadges.map((entry) => (
                      <View key={entry.badge.id} className="w-[47%]">
                        <BadgeCard
                          name={entry.badge.name}
                          subtitle={
                            entry.earned
                              ? formatCatalogDate(entry.awardedAt) || t('gamification:badges.earned')
                              : t('gamification:badges.locked')
                          }
                          locked={!entry.earned}
                          imageUrl={resolveMediaUrl(entry.badge.imageUrl)}
                          onPress={() => router.push('/(explorer)/badges')}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* ── Recent activity ── */}
              <View className="gap-[24px]">
                <Text variant="headlineSmall" className="font-bold text-on-surface">
                  {t('profile.recentActivity')}
                </Text>
                {recentActivity.length === 0 ? (
                  <Surface tone="lowest" className="p-[24px] rounded-lg">
                    <LabelCaps className="text-on-surface-variant">
                      {t('gamification:journal.empty')}
                    </LabelCaps>
                  </Surface>
                ) : (
                  <View className="gap-[16px]">
                    {recentActivity.map((entry) => (
                      <ActivityItem
                        key={entry.id}
                        title={activityTitle(entry, t('gamification:journal.checkInFallback'))}
                        meta={activityMeta(entry)}
                        kind={entry.kind}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
