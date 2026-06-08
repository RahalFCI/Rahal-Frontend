/**
 * useGoogleSignIn - browser-based Google OAuth for the Explorer mobile app.
 * Sends Google's ID token to the backend, then stores Rahal's own token pair.
 */
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { env } from '../../../config/env';
import { ApiError } from '../../../shared/api/errors';
import { googleSignIn } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_AUTH_NOT_CONFIGURED = 'GOOGLE_AUTH_NOT_CONFIGURED';

const FALLBACK_CLIENT_ID = 'missing-google-client-id.apps.googleusercontent.com';

function getActiveClientId() {
  const platformClientId = Platform.select({
    ios: env.GOOGLE_IOS_CLIENT_ID,
    android: env.GOOGLE_ANDROID_CLIENT_ID,
    web: env.GOOGLE_WEB_CLIENT_ID,
    default: env.GOOGLE_WEB_CLIENT_ID,
  });

  return platformClientId || env.GOOGLE_WEB_CLIENT_ID;
}

export function useGoogleSignIn() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [isPromptPending, setIsPromptPending] = useState(false);

  const activeClientId = getActiveClientId();
  const isConfigured = Boolean(activeClientId);

  const googleConfig = useMemo(
    () => ({
      clientId: activeClientId || FALLBACK_CLIENT_ID,
      webClientId: env.GOOGLE_WEB_CLIENT_ID || undefined,
      iosClientId: env.GOOGLE_IOS_CLIENT_ID || undefined,
      androidClientId: env.GOOGLE_ANDROID_CLIENT_ID || undefined,
      selectAccount: true,
    }),
    [activeClientId],
  );

  const [request, , promptAsync] = Google.useIdTokenAuthRequest(googleConfig, {
    scheme: 'rahal',
    path: 'oauthredirect',
  });

  const mutation = useMutation({
    mutationFn: (idToken: string) => googleSignIn({ idToken }),
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      router.replace('/(explorer)');
    },
  });

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      throw new Error(GOOGLE_AUTH_NOT_CONFIGURED);
    }

    setIsPromptPending(true);
    try {
      const result = await promptAsync();

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { cancelled: true };
      }

      if (result.type !== 'success') {
        throw new ApiError('UNKNOWN', 'Google sign-in did not complete', 0);
      }

      const idToken = result.params.id_token || result.authentication?.idToken;

      if (!idToken) {
        throw new ApiError('UNKNOWN', 'Google did not return an ID token', 0);
      }

      await mutation.mutateAsync(idToken);
      return { cancelled: false };
    } finally {
      setIsPromptPending(false);
    }
  }, [isConfigured, mutation, promptAsync]);

  return {
    signInWithGoogle,
    isConfigured,
    isReady: isConfigured && Boolean(request),
    isPending: isPromptPending || mutation.isPending,
  };
}
