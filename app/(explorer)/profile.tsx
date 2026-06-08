/**
 * Profile screen — Explorer identity, gamification summary, and activity feed.
 * Figma: node 1:799. Real data: name, photo, level, XP from ExplorerProfile + UserStats.
 * Placeholder data (Phase 3 replaces): streak, visited count, badges, recent activity.
 *
 * Design deviations from Figma (design.md rules applied):
 * - Badge card borders removed (No-Line Rule); tonal bg shift used instead.
 * - Top bar separator line removed; tonal backdrop is enough.
 * - Locked badge desaturation via opacity-60 + surfaceContainerLow (RN platform limit).
 * - Badge amber bg (#FFFBEB) → bg-primary-container/20 (no new hex tokens).
 */
import { View, ScrollView, Pressable, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LogOut, Star, Zap, MapPin, Trophy, ChevronRight, Pencil } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { useSignOut } from '../../src/features/auth/hooks/useSignOut';
import { ApiError } from '../../src/shared/api/errors';
import { resolveMediaUrl } from '../../src/shared/utils/mediaUrl';
import { tokens } from '../../src/shared/theme';
import type { ExplorerProfileDto } from '../../src/features/auth/api/authApi';

// --- Placeholder data (Phase 3: replace with real API calls) ---
const PLACEHOLDER_STREAK = 12;
const PLACEHOLDER_VISITED = 84;
const PLACEHOLDER_BADGES = [
  { id: '1', name: 'Pyramid Pro', subtitle: 'LVL 3 MASTER', locked: false },
  { id: '2', name: 'Kushari King', subtitle: '12 PLACES VISITED', locked: false },
  { id: '3', name: 'Hieroglyphist', subtitle: 'LOCKED', locked: true },
  { id: '4', name: 'Nile Navigator', subtitle: '5 RIVER TRIPS', locked: false },
];
const PLACEHOLDER_ACTIVITY = [
  {
    id: '1',
    title: 'Khan el-Khalili exploration',
    subtitle: 'completed',
    meta: 'YESTERDAY • +450 XP',
    type: 'place' as const,
  },
  {
    id: '2',
    title: 'Achieved Pyramid Pro Badge',
    subtitle: '',
    meta: '2 DAYS AGO • ACHIEVEMENT',
    type: 'badge' as const,
  },
  {
    id: '3',
    title: 'Visited Giza Plateau',
    subtitle: '',
    meta: '4 DAYS AGO • +200 XP',
    type: 'place' as const,
  },
];

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

function BadgeCard({
  name,
  subtitle,
  locked,
}: {
  name: string;
  subtitle: string;
  locked: boolean;
}) {
  return (
    <View
      className={`flex-1 items-center p-[17px] rounded-lg gap-[11px] ${
        locked ? 'bg-surface-container-low opacity-60' : 'bg-surface-container-lowest'
      }`}
      style={
        !locked
          ? {
              shadowColor: tokens.colors.onSurface,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 20,
              elevation: 2,
            }
          : undefined
      }
    >
      <View
        className={`w-[64px] h-[64px] rounded-xl items-center justify-center ${
          locked ? 'bg-surface-container' : 'bg-primary-container/20'
        }`}
      >
        <Trophy
          size={28}
          color={locked ? tokens.colors.onSurfaceVariant : tokens.colors.primary}
          strokeWidth={1.5}
        />
      </View>
      <View className="items-center gap-[2px]">
        <Text variant="bodyMedium" className="font-bold text-on-surface text-center">
          {name}
        </Text>
        <LabelCaps className={locked ? 'text-on-surface-variant' : 'text-primary'}>
          {subtitle}
        </LabelCaps>
      </View>
    </View>
  );
}

function ActivityItem({
  title,
  subtitle,
  meta,
  type,
}: {
  title: string;
  subtitle: string;
  meta: string;
  type: 'place' | 'badge';
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
          type === 'badge' ? 'bg-primary-container/20' : 'bg-surface-container'
        }`}
      >
        {type === 'badge' ? (
          <Zap size={20} color={tokens.colors.primary} strokeWidth={2} />
        ) : (
          <MapPin size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
        )}
      </View>

      <View className="flex-1 min-w-0">
        <Text variant="bodyMedium" className="font-bold text-on-surface" numberOfLines={2}>
          {title}
          {subtitle ? (
            <Text variant="bodyMedium" className="font-normal text-on-surface">
              {' '}
              {subtitle}
            </Text>
          ) : null}
        </Text>
        <LabelCaps className="text-on-surface-variant mt-[2px]">{meta}</LabelCaps>
      </View>

      {type === 'place' ? (
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
  onLogout,
  onEdit,
  logoutLabel,
  editLabel,
}: {
  profile: ExplorerProfileDto | undefined;
  onLogout: () => void;
  onEdit: () => void;
  logoutLabel: string;
  editLabel: string;
}) {
  const user = useAuthStore((s) => s.user);
  const initial = (profile?.name ?? user?.displayName ?? 'E')[0]?.toUpperCase() ?? 'E';
  const levelDisplay = profile?.level != null ? `LVL ${profile.level}` : null;
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

  // XP progress within the current level.
  // Approximation: each level requires 1000 XP. Phase 3: replace with real thresholds.
  const levelXpRange = 1000;
  const levelXpStart = profile ? profile.level * levelXpRange : 0;
  const currentLevelXp = profile ? Math.max(0, profile.cumlativeXp - levelXpStart) : 0;
  const progressPct = Math.min(1, currentLevelXp / levelXpRange);

  const birthYear = profile?.birthDate ? new Date(profile.birthDate).getFullYear() : null;
  const bioText = profile?.bio || null;

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Sticky glass top bar */}
        <TopBar
          profile={profile}
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
                        {t('profile.levelProgress', { level: profile.level })}
                      </LabelCaps>
                      <Text variant="labelSmall" className="text-primary font-bold">
                        {currentLevelXp.toLocaleString()} / {levelXpRange.toLocaleString()} XP
                      </Text>
                    </View>
                    <View className="h-[12px] rounded-xl overflow-hidden bg-surface-container">
                      <View
                        className="h-full rounded-xl bg-primary"
                        style={{ width: `${Math.round(progressPct * 100)}%` }}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* ── Stats bento ── */}
              <View className="gap-[16px]">
                <View className="flex-row gap-[16px]">
                  <StatCard
                    value={(profile?.cumlativeXp ?? 0).toLocaleString()}
                    label={t('profile.totalXp')}
                  />
                  {/* Phase 3: replace PLACEHOLDER_VISITED with real visited count */}
                  <StatCard value={String(PLACEHOLDER_VISITED)} label={t('profile.visited')} />
                </View>
                {/* Phase 3: replace PLACEHOLDER_STREAK with real streak */}
                <StatCard
                  value={`${PLACEHOLDER_STREAK} ${t('profile.streakUnit')}`}
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
                  {/* Phase 3: navigate to badges screen */}
                  <Text variant="bodyMedium" className="text-primary font-bold">
                    {t('profile.badgeViewAll')}
                  </Text>
                </View>

                {/* Phase 3: replace PLACEHOLDER_BADGES with real badge data */}
                <View className="gap-[16px]">
                  <View className="flex-row gap-[16px]">
                    <BadgeCard {...PLACEHOLDER_BADGES[0]} />
                    <BadgeCard {...PLACEHOLDER_BADGES[1]} />
                  </View>
                  <View className="flex-row gap-[16px]">
                    <BadgeCard {...PLACEHOLDER_BADGES[2]} />
                    <BadgeCard {...PLACEHOLDER_BADGES[3]} />
                  </View>
                </View>
              </View>

              {/* ── Recent activity ── */}
              <View className="gap-[24px]">
                <Text variant="headlineSmall" className="font-bold text-on-surface">
                  {t('profile.recentActivity')}
                </Text>
                {/* Phase 3: replace PLACEHOLDER_ACTIVITY with real activity feed */}
                <View className="gap-[16px]">
                  {PLACEHOLDER_ACTIVITY.map((item) => (
                    <ActivityItem key={item.id} {...item} />
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
