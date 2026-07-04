/**
 * Explorer layout — authenticated tab group using ArchivistBar (claude.md §2.4).
 * Tabs: Discover, Journal, Rewards, Profile.
 */
import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Compass, BookOpen, Newspaper, Ticket, Gem, User } from 'lucide-react-native';
import { ArchivistBar } from '../../src/shared/layout/ArchivistBar';
import { useTheme } from '../../src/shared/theme';
import { Pressable } from 'react-native';
import { Text } from '../../src/shared/components/Text';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { RewardOverlayProvider } from '../../src/features/gamification/components/RewardOverlay';

// Full-screen detail routes that should not show the floating ArchivistBar
// (they have their own back navigation and bottom-pinned UI like composers).
const HIDE_BAR_ROUTES = new Set([
  'social/[id]',
  'social/compose',
  'social/discover',
  'user/[id]',
  'user/[id]/followers',
  'user/[id]/following',
]);

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();

  const activeRouteName = state.routes[state.index]?.name;
  if (activeRouteName && HIDE_BAR_ROUTES.has(activeRouteName)) {
    return null;
  }

  const icons = {
    index: Compass,
    journal: BookOpen,
    social: Newspaper,
    rewards: Ticket,
    premium: Gem,
    profile: User,
  };

  return (
    <ArchivistBar>
      {state.routes.map((route, index) => {
        if (
          route.name === '_dev-auth' ||
          route.name === 'notifications' ||
          route.name === 'edit-profile' ||
          route.name === 'place/[id]' ||
          route.name === 'badges' ||
          route.name === 'badge/[id]' ||
          route.name === 'coupon/[id]' ||
          route.name === 'my-coupons' ||
          route.name === 'travel-plan' ||
          route.name === 'vendor/[id]' ||
          route.name === 'social/[id]' ||
          route.name === 'social/compose' ||
          route.name === 'social/discover' ||
          route.name === 'user/[id]' ||
          route.name === 'user/[id]/followers' ||
          route.name === 'user/[id]/following'
        )
          return null;
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const IconComponent = icons[route.name as keyof typeof icons] ?? Compass;
        const label = options.title ?? route.name;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            // flex-1 so all six tabs share the bar width evenly and never overflow
            // past the right edge (a bottom nav shouldn't scroll horizontally).
            className="flex-1 items-center py-[4px] px-[2px]"
          >
            <IconComponent
              size={22}
              color={isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
              strokeWidth={isFocused ? 2 : 1.5}
            />
            <Text
              numberOfLines={1}
              variant="labelSmall"
              className={isFocused ? 'text-primary mt-[2px]' : 'text-on-surface-variant mt-[2px]'}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ArchivistBar>
  );
}

export default function ExplorerLayout() {
  const { t } = useTranslation();
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!accessToken) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <RewardOverlayProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        // `history` so pressing back from a detail/hidden tab (coupon, my-coupons,
        // vendor…) returns to the tab you came from, not the first tab (the map).
        backBehavior="history"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: t('tabs.discover') }} />
        <Tabs.Screen name="journal" options={{ title: t('tabs.journal') }} />
        <Tabs.Screen name="social" options={{ title: t('tabs.social') }} />
        <Tabs.Screen name="rewards" options={{ title: t('tabs.coupons') }} />
        <Tabs.Screen name="premium" options={{ title: t('tabs.premium') }} />
        <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="place/[id]" options={{ href: null }} />
        <Tabs.Screen name="badges" options={{ href: null }} />
        <Tabs.Screen name="badge/[id]" options={{ href: null }} />
        <Tabs.Screen name="coupon/[id]" options={{ href: null }} />
        <Tabs.Screen name="my-coupons" options={{ href: null }} />
        <Tabs.Screen name="travel-plan" options={{ href: null }} />
        <Tabs.Screen name="vendor/[id]" options={{ href: null }} />
        <Tabs.Screen name="social/[id]" options={{ href: null }} />
        <Tabs.Screen name="social/compose" options={{ href: null }} />
        <Tabs.Screen name="social/discover" options={{ href: null }} />
        <Tabs.Screen name="user/[id]" options={{ href: null }} />
        <Tabs.Screen name="user/[id]/followers" options={{ href: null }} />
        <Tabs.Screen name="user/[id]/following" options={{ href: null }} />
        <Tabs.Screen name="_dev-auth" options={{ href: null }} />
      </Tabs>
    </RewardOverlayProvider>
  );
}
