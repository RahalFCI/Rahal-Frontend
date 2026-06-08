/**
 * Root index — redirects to the appropriate route group based on auth state.
 * Acts as the route guard (claude.md §2.6).
 */
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth/store/authStore';

export default function Index() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (accessToken) {
    return <Redirect href="/(explorer)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
