/**
 * TanStack Query client configured with:
 * - 60s default stale time
 * - Retry backoff respecting 60 req/min rate limit
 * - Persistence via @tanstack/query-async-storage-persister
 *
 * Note: expo-file-system@19 removed the legacy documentDirectory export.
 * The new Paths API can crash at eager init time on some platforms,
 * so we defer all FS operations and catch failures gracefully.
 *
 * See claude.md §2.2 and §3.5.
 */
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
    mutations: {
      retry: false,
    },
  },
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  }),
);

/**
 * Lazy file-system storage that defers all expo-file-system access.
 * Gracefully degrades to no-op on web or if FS is unavailable.
 */
function createLazyFileStorage() {
  let cacheDir: InstanceType<typeof import('expo-file-system').Directory> | null = null;
  let initialized = false;

  const init = async () => {
    if (initialized) return;
    initialized = true;
    if (Platform.OS === 'web') return;
    try {
      const { Paths, Directory } = await import('expo-file-system');
      cacheDir = new Directory(Paths.document, 'query-cache');
      if (!cacheDir.exists) {
        cacheDir.create();
      }
    } catch {
      cacheDir = null;
    }
  };

  return {
    getItem: async (key: string): Promise<string | null> => {
      await init();
      if (!cacheDir) return null;
      try {
        const { File } = await import('expo-file-system');
        const file = new File(cacheDir, `${encodeURIComponent(key)}.json`);
        if (!file.exists) return null;
        return file.text();
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      await init();
      if (!cacheDir) return;
      try {
        const { File } = await import('expo-file-system');
        const file = new File(cacheDir, `${encodeURIComponent(key)}.json`);
        file.write(value);
      } catch {
        // Silently fail — cache is nice-to-have
      }
    },
    removeItem: async (key: string): Promise<void> => {
      await init();
      if (!cacheDir) return;
      try {
        const { File } = await import('expo-file-system');
        const file = new File(cacheDir, `${encodeURIComponent(key)}.json`);
        if (file.exists) {
          file.delete();
        }
      } catch {
        // Silently fail
      }
    },
  };
}

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: createLazyFileStorage(),
});
