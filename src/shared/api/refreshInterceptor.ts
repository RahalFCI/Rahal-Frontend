/**
 * Refresh Token Interceptor (claude.md §2.3 rule 3).
 *
 * Queues concurrent 401s, refreshes once, replays queued requests.
 * On refresh failure: purges auth store and navigates to (auth)/welcome.
 *
 * The refresh function is injected via setRefreshFn() to break the
 * circular dependency: client → refreshInterceptor → authApi → client.
 */
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

type AuthStoreApi = {
  getState: () => {
    accessToken: string | null;
    refreshToken: string | null;
    setSession: (session: { accessToken: string; refreshToken?: string }) => void;
    clearSession: () => void;
  };
};

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

type RefreshFn = (body: { accessToken: string; refreshToken: string }) => Promise<RefreshResponse>;

/**
 * The auth store reference is injected lazily to break the circular dependency
 * between client.ts → refreshInterceptor.ts → authStore.ts → client.ts.
 */
let authStoreRef: AuthStoreApi | null = null;
let refreshFnRef: RefreshFn | null = null;

export function setAuthStoreRef(store: AuthStoreApi) {
  authStoreRef = store;
}

export function setRefreshFn(fn: RefreshFn) {
  refreshFnRef = fn;
}

function getAuthStore(): AuthStoreApi {
  if (!authStoreRef) {
    throw new Error(
      'Auth store not initialized. Call setAuthStoreRef() before making API requests.',
    );
  }
  return authStoreRef;
}

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

function isRefreshEndpoint(url?: string) {
  return url?.includes('/auth/generate') ?? false;
}

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

export function setupRefreshInterceptor(instance: AxiosInstance) {
  // Request interceptor: attach access token
  instance.interceptors.request.use((config) => {
    const token = getAuthStore().getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle 401 + refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        isRefreshEndpoint(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      const store = getAuthStore().getState();
      if (!refreshFnRef || !store.accessToken || !store.refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await refreshFnRef({
          accessToken: store.accessToken,
          refreshToken: store.refreshToken,
        });

        store.setSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        processQueue(null, result.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        getAuthStore().getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
