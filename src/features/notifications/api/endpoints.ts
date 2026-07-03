/**
 * Notifications endpoints (relative to env.API_BASE_URL, which already includes /api).
 * Mirrors the Notifications module NotificationsController: unread-count, list (cursor),
 * per-item read, read-all, and FCM device-token registration. Routes are
 * case-insensitive on the backend.
 */
export const notificationEndpoints = {
  unreadCount: '/notifications/unread-count',
  list: '/notifications',
  markRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
  fcmToken: '/notifications/fcm-token',
} as const;
