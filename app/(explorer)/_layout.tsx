/**
 * Explorer layout — authenticated tab group using ArchivistBar (claude.md §2.4).
 * Tabs: Discover, Journal, Rewards, Profile.
 */
import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Compass, BookOpen, Gift, User } from 'lucide-react-native';
import { ArchivistBar } from '../../src/shared/layout/ArchivistBar';
import { useTheme } from '../../src/shared/theme';
import { Pressable } from 'react-native';
import { Text } from '../../src/shared/components/Text';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../src/features/auth/store/authStore';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();

  const icons = {
    index: Compass,
    journal: BookOpen,
    rewards: Gift,
    profile: User,
  };

  return (
    <ArchivistBar>
      {state.routes.map((route, index) => {
        if (route.name === '_dev-auth' || route.name === 'edit-profile') return null;
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
            className="items-center py-[4px] px-[12px]"
          >
            <IconComponent
              size={24}
              color={isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
              strokeWidth={isFocused ? 2 : 1.5}
            />
            <Text
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
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.discover') }} />
      <Tabs.Screen name="journal" options={{ title: t('tabs.journal') }} />
      <Tabs.Screen name="rewards" options={{ title: t('tabs.rewards') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="_dev-auth" options={{ href: null }} />
    </Tabs>
  );
}
