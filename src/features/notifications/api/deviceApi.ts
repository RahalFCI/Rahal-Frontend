/**
 * Device (FCM push token) registration. The backend stores one FCM token per user
 * (unique index on UserId) and pushes via Firebase Admin, so we send the raw native
 * device token — see useRegisterPushToken. Returns ApiResponse<string> (ignored).
 *
 * NOTE: there is no DELETE endpoint, so logout cannot de-register the token; a stale
 * token lingers server-side until it is overwritten by the next login on this device.
 */
import { apiClient } from '../../../shared/api/client';
import { notificationEndpoints } from './endpoints';

export async function registerFcmToken(token: string): Promise<void> {
  await apiClient<unknown>({
    method: 'POST',
    url: notificationEndpoints.fcmToken,
    data: { token },
  });
}
