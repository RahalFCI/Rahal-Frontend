
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { env } from '../../../config/env';
import { isTokenExpired, parseJwtClaims } from '../utils/jwt';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isHydrated: boolean;

  setSession: (session: { accessToken: string; refreshToken?: string; user?: User }) => void;
  clearSession: () => void;
  hydrate: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'rahal_access_token';
const REFRESH_TOKEN_KEY = 'rahal_refresh_token';

function userFromToken(accessToken: string): User | null {
  try {
    const claims = parseJwtClaims(accessToken);
    return {
      id: claims.sub,
      email: claims.email,
      displayName: claims.email,
      role: claims.role,
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrated: false,

  setSession: ({ accessToken, refreshToken, user }) => {
    const derivedUser = user ?? userFromToken(accessToken);
    set((state) => ({
      accessToken,
      refreshToken: refreshToken ?? state.refreshToken,
      user: derivedUser,
    }));

    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken).catch(() => {});
    if (refreshToken) {
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken).catch(() => {});
    }
  },

  clearSession: () => {
    set({ accessToken: null, refreshToken: null, user: null });
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
  },

  hydrate: async () => {
    try {
      if (env.DEV_BYPASS_AUTH) {
        set({
          accessToken: 'dev-bypass-token',
          refreshToken: 'dev-bypass-refresh',
          user: {
            id: 'dev-user',
            email: 'dev@rahal.app',
            displayName: 'Dev Explorer',
            role: 'Explorer',
          },
          isHydrated: true,
        });
        return;
      }

      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);

      if (accessToken && !isTokenExpired(accessToken)) {
        const user = userFromToken(accessToken);
        set({ accessToken, refreshToken, user, isHydrated: true });
        return;
      }

      if (accessToken && refreshToken) {
        const user = userFromToken(accessToken);
        set({ accessToken, refreshToken, user, isHydrated: true });
        return;
      }

      if (refreshToken) {
        set({ accessToken: null, refreshToken, user: null, isHydrated: true });
        return;
      }

      set({ isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },
}));
