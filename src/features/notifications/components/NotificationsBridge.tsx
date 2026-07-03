/**
 * NotificationsBridge — the app-wide glue for push notifications. Renders nothing.
 * Mounted once inside the root providers/navigation tree, it:
 *   1. registers the FCM device token whenever a session becomes active
 *      (covers app-start restore, email/password login, and Google login);
 *   2. routes OS notification taps to the right screen (foreground taps via a
 *      response listener, cold-start taps via getLastNotificationResponseAsync).
 *
 * Gated behind flags.push. The foreground display handler is set at module load.
 */
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { flags } from '../../../config/flags';
import { useAuthStore } from '../../auth/store/authStore';
import { registerPushToken } from '../pushToken';
import { routeForNotification } from '../utils/route';

// Show a banner + update the badge while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

/**
 * Extracts (type, targetId) from an FCM data payload. The backend serializes the
 * notification DTO (camelCase) under the data key "Notification"; we also fall back
 * to top-level data fields defensively.
 */
function extractRoute(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;

  let type: string | undefined;
  let targetId: string | undefined;

  const raw = data.Notification ?? data.notification;
  if (typeof raw === 'string') {
    try {
      const dto = JSON.parse(raw) as { type?: string; targetId?: string | null };
      type = dto.type ?? undefined;
      targetId = dto.targetId ?? undefined;
    } catch {
      // fall through to top-level fields
    }
  }

  type = type ?? (typeof data.type === 'string' ? data.type : undefined);
  targetId = targetId ?? (typeof data.targetId === 'string' ? data.targetId : undefined);

  return type ? routeForNotification(type, targetId) : null;
}

export function NotificationsBridge() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const handledColdStart = useRef(false);

  // Register the FCM token whenever a session becomes active. Best-effort + idempotent.
  useEffect(() => {
    if (flags.push && accessToken) {
      registerPushToken();
    }
  }, [accessToken]);

  // Route notification taps.
  useEffect(() => {
    if (!flags.push) return;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const path = extractRoute(response.notification.request.content.data as Record<string, unknown>);
      if (path) router.push(path as never);
    });

    // Cold start: the app was launched by tapping a notification.
    if (!handledColdStart.current) {
      handledColdStart.current = true;
      Notifications.getLastNotificationResponseAsync().then((response) => {
        const path = extractRoute(
          response?.notification.request.content.data as Record<string, unknown> | undefined,
        );
        if (path) router.push(path as never);
      });
    }

    return () => sub.remove();
  }, [router]);

  return null;
}
