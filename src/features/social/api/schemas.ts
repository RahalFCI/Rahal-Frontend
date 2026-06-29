/**
 * Zod schemas for the SocialMedia module — validated at the client boundary
 * (CLAUDE.md §2.3 rule 5). Mirror the backend DTOs in
 * docs/social/02-backend-api-contract.md:
 *   PostResponseDto, PostResponse, FeedPagedResponse, CommentResponse,
 *   CommentPagedResponse, SocialUserResponseDto, GenerateUploadSignaturesResponse.
 *
 * Optional/nullable fields use `.nullish()` defensively (matching the rewards /
 * gamification schemas). Two cursor styles: feed/user-posts use a numeric (long)
 * cursor; comments/replies use an ISO DateTime string cursor.
 */
import { z } from 'zod';
import { pagedSchema } from '../../gamification/api/schemas';

export { pagedSchema };

/** PostResponseDto — a post as rendered in the feed / detail / profile. */
export const postSchema = z.object({
  id: z.string(),
  content: z.string().nullish(),
  authorId: z.string(),
  /** Added by the A2 backend fix; resolved via the Users gateway. */
  authorName: z.string().nullish(),
  likesCount: z.number(),
  commentsCount: z.number(),
  isLikedByThisUser: z.boolean(),
  createdAt: z.string(),
  isPublic: z.boolean(),
  mediaUrls: z.array(z.string()).nullish(),
});

/** FeedPagedResponse — feed + user-posts. `nextCursor` is a long (unix seconds). */
export const feedPageSchema = z.object({
  posts: z.array(postSchema),
  nextCursor: z.number().nullish(),
});

/** PostResponse — the create-post response (no counts yet). */
export const postCreatedSchema = z.object({
  id: z.string(),
  userId: z.string().nullish(),
  content: z.string().nullish(),
  isPublic: z.boolean().nullish(),
  mediaUrls: z.array(z.string()).nullish(),
  createdAt: z.string().nullish(),
});

/** CommentResponse — a comment or reply. `userDisplayName` may be null on create/edit. */
export const commentSchema = z.object({
  id: z.string(),
  postId: z.string().nullish(),
  userId: z.string().nullish(),
  userDisplayName: z.string().nullish(),
  parentCommentId: z.string().nullish(),
  content: z.string(),
  repliesCount: z.number(),
  createdAt: z.string(),
});

/** CommentPagedResponse — `nextCursor` is an ISO DateTime string. */
export const commentPageSchema = z.object({
  comments: z.array(commentSchema),
  nextCursor: z.string().nullish(),
});

/** SocialUserResponseDto — a person in lists/profiles. No avatar (use initials). */
export const socialUserSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  followersCount: z.number(),
  followingCount: z.number(),
  /** Not populated by the backend today; FE derives follow state separately. */
  isFollowedByMe: z.boolean().nullish(),
});
export const pagedSocialUsersSchema = pagedSchema(socialUserSchema);

/** GenerateUploadSignaturesResponse — Cloudinary signed-upload credentials. */
export const uploadSignatureItemSchema = z.object({
  publicId: z.string(),
  signature: z.string(),
  timestamp: z.number(),
  apiKey: z.string(),
  cloudName: z.string(),
});
export const uploadSignaturesSchema = z.object({
  signatures: z.array(uploadSignatureItemSchema),
});

export type Post = z.infer<typeof postSchema>;
export type FeedPage = z.infer<typeof feedPageSchema>;
export type PostCreated = z.infer<typeof postCreatedSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type CommentPage = z.infer<typeof commentPageSchema>;
export type SocialUser = z.infer<typeof socialUserSchema>;
export type PagedSocialUsers = z.infer<typeof pagedSocialUsersSchema>;
export type UploadSignatureItem = z.infer<typeof uploadSignatureItemSchema>;

/** SocialMedia.Domain.Enums.MediaType. */
export const MediaTypeEnum = { Image: 1, Gif: 2, Video: 3 } as const;
export type MediaTypeValue = (typeof MediaTypeEnum)[keyof typeof MediaTypeEnum];
