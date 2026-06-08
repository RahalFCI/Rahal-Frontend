/**
 * Typed access to EXPO_PUBLIC_* environment variables.
 */
import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:7145/api';

function getExpoHostIp() {
  const constants = Constants as typeof Constants & {
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };

  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost;

  return hostUri?.split(':')[0];
}

function resolveApiBaseUrl() {
  const configuredUrl = (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.trim();
  const apiBaseUrl = configuredUrl || DEFAULT_API_BASE_URL;

  /**
   * Expo Go on a physical Android device cannot reach a backend via localhost,
   * because localhost points at the phone. During development, derive the PC's
   * LAN IP from Expo's packager URL and preserve the backend port/path.
   */
  if (__DEV__) {
    const expoHostIp = getExpoHostIp();

    if (expoHostIp && !['localhost', '127.0.0.1'].includes(expoHostIp)) {
      return apiBaseUrl.replace(
        /^http:\/\/(?:localhost|127\.0\.0\.1)(?=[:/])/,
        `http://${expoHostIp}`,
      );
    }
  }

  return apiBaseUrl;
}

const resolvedApiBaseUrl = resolveApiBaseUrl();

export const env = {
  /** Base URL for the Rahal API (e.g., https://api.rahal.app/v1) */
  API_BASE_URL: resolvedApiBaseUrl,

  /** Base URL for static media (strips /api suffix). Used to resolve relative /uploads/... paths. */
  MEDIA_BASE_URL: resolvedApiBaseUrl.replace(/\/api.*$/, ''),

  /**
   * Dev-only: when "true", seeds a fake session on hydrate so developers
   * can land on the authenticated shell without a real backend.
   */
  DEV_BYPASS_AUTH: process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true',

  /** Public OAuth client IDs. Configure these in Google Cloud per platform. */
  GOOGLE_WEB_CLIENT_ID:
    (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined)?.trim() ?? '',
  GOOGLE_IOS_CLIENT_ID:
    (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string | undefined)?.trim() ?? '',
  GOOGLE_ANDROID_CLIENT_ID:
    (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string | undefined)?.trim() ?? '',

  /** Optional public token for Mapbox-hosted styles/tiles in custom dev clients. */
  MAPBOX_ACCESS_TOKEN:
    (process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string | undefined)?.trim() ?? '',

  /** Override for the vector base map style. Defaults to a public MapLibre demo style. */
  MAP_STYLE_URL:
    (process.env.EXPO_PUBLIC_MAP_STYLE_URL as string | undefined)?.trim() ??
    'https://demotiles.maplibre.org/style.json',
} as const;
