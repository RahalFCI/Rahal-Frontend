/**
 * Root layout — providers, font loading, auth hydration, splash gate.
 * See claude.md §3.6 and phase_0_prompt.md §3.6.
 */
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../src/shared/api/queryClient';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { setAuthStoreRef, setRefreshFn } from '../src/shared/api/refreshInterceptor';
import { refreshTokens } from '../src/features/auth/api/authApi';
import { StripeProvider } from '@stripe/stripe-react-native';
import { env } from '../src/config/env';
import { ToastProvider } from '../src/shared/components/Toast';
import { NotificationsBridge } from '../src/features/notifications/components/NotificationsBridge';
import '../src/shared/i18n';
import '../global.css';

// Keep splash screen visible until everything is ready
SplashScreen.preventAutoHideAsync();

// Wire auth store into the refresh interceptor (breaks circular dependency)
setAuthStoreRef(useAuthStore);

// Wire the refresh token function into the interceptor
setRefreshFn(refreshTokens);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('../assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
  });

  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  // Don't render until fonts and auth are ready
  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <SafeAreaProvider>
        <ToastProvider>
          <StripeProvider
            publishableKey={env.STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.rahal.app"
          >
            <StatusBar style="dark" />
            <Slot />
            <NotificationsBridge />
          </StripeProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
