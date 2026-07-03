/**
 * Maps a notification (type + targetId) to an in-app route, shared by the OS-tap
 * response listener and in-app row taps.
 *
 * - PostLike / PostComment / NewPost carry targetId = postId -> post detail.
 * - Follow carries no targetId (and the actor is not exposed in the DTO), so it
 *   cannot deep-link to the follower; we fall back to the notifications list.
 * - Anything unknown / missing target -> null (caller stays put / opens the list).
 */
import { NotificationType } from '../api/schemas';

export function routeForNotification(type: string, targetId?: string | null): string | null {
  switch (type) {
    case NotificationType.PostLike:
    case NotificationType.PostComment:
    case NotificationType.NewPost:
      return targetId ? `/(explorer)/social/${targetId}` : null;
    case NotificationType.Follow:
      return '/(explorer)/notifications';
    default:
      return null;
  }
}
