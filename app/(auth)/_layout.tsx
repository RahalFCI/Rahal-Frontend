/**
 * Auth layout — unauthenticated stack (claude.md §2.4).
 * Defines screen order: welcome (initial) → sign-in, sign-up.
 */
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function AuthLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (accessToken) {
    return <Redirect href="/(explorer)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
