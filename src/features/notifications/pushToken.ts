/**
 * Best-effort FCM device-token registration.
 *
 * The backend pushes via Firebase Admin using a raw FCM registration token, so we
 * send the *native device* token (getDevicePushTokenAsync -> FCM token on Android),
 * NOT an Expo push token. This needs Firebase config (google-services.json) baked
 * into the dev client; without it getDevicePushTokenAsync throws, so the whole flow
 * is wrapped and silently no-ops — the in-app notification center still works via
 * polling. Call after auth is established (login + app start); it is idempotent.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { flags } from '../../config/flags';
import { requestNotificationPermissions } from '../../shared/notifications/permissions';
import { registerFcmToken } from './api/deviceApi';

export async function registerPushToken(): Promise<void> {
  if (!flags.push || Platform.OS === 'web') return;

  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    const token = devicePushToken?.data;
    if (typeof token !== 'string' || token.length === 0) return;

    await registerFcmToken(token);
  } catch (error) {
    // Firebase not configured, no network, or backend rejected — non-fatal.
    if (__DEV__) {
      console.warn('[push] token registration skipped:', error);
    }
  }
}
