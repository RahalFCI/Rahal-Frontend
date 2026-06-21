/**
 * Check-in endpoints — `CheckInController` (`/api/checkin`).
 * See docs/backend-api-reference.md §Check-ins.
 */
export const checkInEndpoints = {
  /** POST CheckInRequestDto → records a check-in for the explorer. */
  create: (explorerId: string) => `/CheckIn/${explorerId}`,
  /** GET an explorer's check-in at a single place (existence / status probe). */
  forPlace: (explorerId: string, placeId: string) => `/CheckIn/${explorerId}/${placeId}`,
} as const;
