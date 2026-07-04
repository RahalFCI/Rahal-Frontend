/**
 * Zod schemas for check-in requests/responses — validated at the client boundary
 * (CLAUDE.md §2.3 rule 5). Mirrors CheckInRequestDto / GetCheckInDto from
 * docs/backend-api-reference.md §Check-ins.
 */
import { z } from 'zod';

/**
 * CheckInRequestDto. The geo/integrity fields feed server-side validation
 * (Haversine vs `place.geoFenceRange`, mock-location + jailbreak signals).
 */
export interface CheckInRequest {
  placeId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
  isMockLocation: boolean;
  isJailbroken: boolean;
}

/**
 * GetCheckInDto — `validationStatusName` is the human-readable server verdict.
 * NOTE: the backend serializes enums as their string name (JsonStringEnumConverter
 * is configured globally — e.g. ApiResponse.errorCode comes back as "None"), so
 * `validationStatus` arrives as a string like "Verified", not a number. Accept both.
 */
export const checkInSchema = z.object({
  /** GetCheckInDto.CheckInId — the check-in's own id (needed to link a challenge attempt). */
  checkInId: z.string().nullish(),
  explorerId: z.string().nullish(),
  placeId: z.string().nullish(),
  validationStatus: z.union([z.number(), z.string()]).nullish(),
  validationStatusName: z.string().nullish(),
  placeName: z.string().nullish(),
  /** GetCheckInDto carries no createdAt today (backend gap); kept for forward-compat. */
  createdAt: z.string().nullish(),
});

export type CheckIn = z.infer<typeof checkInSchema>;

/**
 * Generic `PagedResult<T>` wrapper (CLAUDE.md / backend-api-reference). Pass an
 * item schema; mirrors `pagedPlacesSchema` in the places feature without coupling
 * the two feature folders.
 */
export function pagedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    totalCount: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  });
}

/** GetXpTransactionDto — one entry in the XP ledger. No place name (label by source). */
export const xpTransactionSchema = z.object({
  id: z.string(),
  explorerId: z.string().nullish(),
  amount: z.number(),
  sourceType: z.string().nullish(),
  referenceId: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export const pagedXpTransactionsSchema = pagedSchema(xpTransactionSchema);

/** GetBadgeDto — `imageUrl` may be relative (resolve against MEDIA_BASE_URL). */
export const badgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export const pagedBadgesSchema = pagedSchema(badgeSchema);

/** GetAchievementDto — template; `badgeId` links the badge a completion awards. */
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  badgeId: z.string().nullish(),
  badgeName: z.string().nullish(),
  xpReward: z.number().nullish(),
  criteriaTypeId: z.string().nullish(),
  criteriaCode: z.string().nullish(),
  criteriaThreshold: z.number().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export const pagedAchievementsSchema = pagedSchema(achievementSchema);

/** GetChallengeDto — a challenge template attached to a place. */
export const challengeSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  validationPrompt: z.string().nullish(),
  type: z.string().nullish(),
  difficulty: z.string().nullish(),
  minimumLevelRequired: z.number().nullish(),
  xpReward: z.number().nullish(),
  isActive: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});
export const pagedChallengesSchema = pagedSchema(challengeSchema);

/**
 * GetCheckInChallengeDto — one explorer's attempt at a challenge, linked to a
 * check-in. `validationStatus` is the stringified ChallengeValidationStatus
 * ("Pending" | "Approved" | "Rejected"). `proofMediaUrl` is currently always empty
 * (the backend does not persist the uploaded photo), kept for forward-compat.
 */
export const checkInChallengeSchema = z.object({
  id: z.string(),
  challengeId: z.string(),
  challengeName: z.string().nullish(),
  checkInId: z.string(),
  explorerId: z.string().nullish(),
  proofMediaUrl: z.string().nullish(),
  validationStatus: z.string().nullish(),
});
export const pagedCheckInChallengesSchema = pagedSchema(checkInChallengeSchema);

/**
 * GetExplorerAchievementDto — an achievement the explorer has earned.
 * Backend fields: id, achievementId, achievementTitle, explorerId, earnedAt,
 * isNotified. (No badgeName/xpReward on this DTO — those live on the achievement
 * template; the awarded date is `earnedAt`, not `awardedAt`.)
 */
export const explorerAchievementSchema = z.object({
  id: z.string(),
  achievementId: z.string(),
  explorerId: z.string().nullish(),
  achievementTitle: z.string().nullish(),
  earnedAt: z.string().nullish(),
  isNotified: z.boolean().nullish(),
});
export const pagedExplorerAchievementsSchema = pagedSchema(explorerAchievementSchema);

export const pagedCheckInsSchema = pagedSchema(checkInSchema);

export type XpTransaction = z.infer<typeof xpTransactionSchema>;
export type Badge = z.infer<typeof badgeSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type CheckInChallenge = z.infer<typeof checkInChallengeSchema>;
export type ExplorerAchievement = z.infer<typeof explorerAchievementSchema>;
