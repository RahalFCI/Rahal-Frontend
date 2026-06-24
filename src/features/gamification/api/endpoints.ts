/**
 * Gamification endpoints. Check-in is `CheckInController`; the rest map to the
 * XpTransaction / Badge / Achievement / ExplorerAchievement controllers
 * (all Bearer-gated). See docs/backend-api-reference.md.
 */
export const checkInEndpoints = {
  /** POST CheckInRequestDto → records a check-in for the explorer. */
  create: (explorerId: string) => `/CheckIn/${explorerId}`,
  /** GET an explorer's check-in at a single place (existence / status probe). */
  forPlace: (explorerId: string, placeId: string) => `/CheckIn/${explorerId}/${placeId}`,
  /** GET an explorer's check-in history (paginated). */
  historyForExplorer: (explorerId: string) => `/CheckIn/explorer/${explorerId}`,
} as const;

export const xpTransactionEndpoints = {
  /** GET an explorer's XP ledger (paginated). */
  forExplorer: (explorerId: string) => `/XpTransaction/explorer/${explorerId}`,
} as const;

export const badgeEndpoints = {
  /** GET all badges (the catalog, paginated). */
  list: '/Badge',
  byId: (id: string) => `/Badge/${id}`,
} as const;

export const achievementEndpoints = {
  /** GET all achievement templates (paginated). */
  list: '/Achievement',
  byId: (id: string) => `/Achievement/${id}`,
} as const;

export const explorerAchievementEndpoints = {
  /** GET the achievements an explorer has earned (paginated). */
  forExplorer: (explorerId: string) => `/ExplorerAchievement/explorer/${explorerId}`,
} as const;
