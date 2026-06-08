/**
 * Dev Auth Diagnostics — temporary screen for verifying the auth lifecycle.
 * Gated by __DEV__. Removed before Phase 7 polish.
 *
 * Buttons: Show Tokens, Force Refresh, Simulate 401, Logout.
 */
import { View, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useRefreshToken } from '../../src/features/auth/hooks/useRefreshToken';
import { useSignOut } from '../../src/features/auth/hooks/useSignOut';
import { parseJwtClaims } from '../../src/features/auth/utils/jwt';
import { apiClient } from '../../src/shared/api/client';

function DevButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-container-high rounded-sm px-[16px] py-[12px]"
    >
      <Text variant="bodyLarge" className="text-on-surface font-bold">
        {label}
      </Text>
    </Pressable>
  );
}

export default function DevAuthScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const user = useAuthStore((s) => s.user);
  const refresh = useRefreshToken();
  const signOut = useSignOut();

  if (!__DEV__) return null;

  const showTokens = () => {
    const info = [
      `Access: ${accessToken ? accessToken.substring(0, 30) + '...' : 'null'}`,
      `Refresh: ${refreshToken ? refreshToken.substring(0, 20) + '...' : 'null'}`,
      `User: ${JSON.stringify(user, null, 2)}`,
    ];

    if (accessToken && accessToken !== 'dev-bypass-token') {
      try {
        const claims = parseJwtClaims(accessToken);
        info.push(`\nJWT Claims:\n${JSON.stringify(claims, null, 2)}`);
        info.push(`Expires: ${new Date(claims.exp * 1000).toISOString()}`);
      } catch (e) {
        info.push(`\nJWT parse error: ${e}`);
      }
    }

    Alert.alert('Auth State', info.join('\n'));
  };

  const forceRefresh = () => {
    if (!accessToken || !refreshToken) {
      Alert.alert('Error', 'No tokens available');
      return;
    }
    refresh.mutate(
      { accessToken, refreshToken },
      {
        onSuccess: () => Alert.alert('Success', 'Tokens refreshed'),
        onError: (e) => Alert.alert('Refresh Failed', String(e)),
      },
    );
  };

  const simulate401 = async () => {
    try {
      // Call a protected endpoint with an invalid token to trigger 401 → refresh flow
      await apiClient({ method: 'GET', url: '/explorer/999999' });
      Alert.alert('Result', 'Request succeeded (unexpected)');
    } catch (e) {
      Alert.alert('401 Simulation', `Error: ${e}`);
    }
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="p-[24px] gap-[16px]">
          <Text variant="headlineLarge">Dev Auth</Text>
          <LabelCaps>Diagnostics screen — DEV only</LabelCaps>

          <View className="gap-[12px] mt-[16px]">
            <DevButton label="Show Current Tokens" onPress={showTokens} />
            <DevButton label="Force Refresh Now" onPress={forceRefresh} />
            <DevButton label="Simulate 401" onPress={simulate401} />
            <DevButton label="Logout" onPress={signOut} />
          </View>

          {refresh.isPending && (
            <Text variant="bodyMedium" className="text-on-surface-variant">
              Refreshing...
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
