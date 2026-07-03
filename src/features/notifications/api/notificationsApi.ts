/**
 * Notifications API. All routes derive userId from the JWT, so no id is passed.
 * List uses an ISO DateTime cursor (omit for the first page). Mark-read / read-all
 * return an ApiResponse<string> we don't need, so their bodies are ignored.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { notificationEndpoints } from './endpoints';
import {
  notificationsPageSchema,
  unreadCountSchema,
  type NotificationsPage,
  type UnreadCount,
} from './schemas';

export async function getUnreadCount(): Promise<UnreadCount> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: notificationEndpoints.unreadCount,
  });
  return zodParse(unreadCountSchema, data);
}

export async function getNotifications(
  cursor?: string,
  limit = 20,
): Promise<NotificationsPage> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: notificationEndpoints.list,
    params: { cursor, limit },
  });
  return zodParse(notificationsPageSchema, data);
}

export async function markRead(id: string): Promise<void> {
  await apiClient<unknown>({ method: 'PATCH', url: notificationEndpoints.markRead(id) });
}

export async function markAllRead(): Promise<void> {
  await apiClient<unknown>({ method: 'PATCH', url: notificationEndpoints.markAllRead });
}
