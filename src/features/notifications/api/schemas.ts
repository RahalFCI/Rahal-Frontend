/**
 * Zod schemas for the Notifications module — validated at the client boundary
 * (CLAUDE.md §2.3 rule 5). Mirror the backend DTOs (NotificationResponseDto,
 * NotificationsPagedResponse, UnreadCountResponse).
 *
 * Optional/nullable fields use `.nullish()` defensively (matching the social /
 * rewards / gamification schemas). The list cursor is an ISO DateTime string
 * (backend keyset on CreatedAt).
 */
import { z } from 'zod';

/**
 * Backend NotificationType stored values (Notifications.Domain.Enums). Only four
 * social types exist today. `type` is kept as a raw string on the schema so an
 * unknown future type never fails validation; routing uses these constants.
 */
export const NotificationType = {
  PostLike: 'Social.PostLike',
  PostComment: 'Social.PostComment',
  NewPost: 'Social.NewPost',
  Follow: 'Social.Follow',
} as const;
export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

/** NotificationResponseDto — a single notification. `message` is server-rendered. */
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string().nullish(),
  type: z.string(),
  targetId: z.string().nullish(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

/** NotificationsPagedResponse — `nextCursor` is an ISO DateTime string (or null). */
export const notificationsPageSchema = z.object({
  notifications: z.array(notificationSchema),
  nextCursor: z.string().nullish(),
});

/** UnreadCountResponse. */
export const unreadCountSchema = z.object({
  unreadCount: z.number(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationsPage = z.infer<typeof notificationsPageSchema>;
export type UnreadCount = z.infer<typeof unreadCountSchema>;
