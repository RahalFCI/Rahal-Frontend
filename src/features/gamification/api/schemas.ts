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

/** GetCheckInDto — `validationStatusName` is the human-readable server verdict. */
export const checkInSchema = z.object({
  explorerId: z.string().nullish(),
  placeId: z.string().nullish(),
  validationStatus: z.number().nullish(),
  validationStatusName: z.string().nullish(),
  placeName: z.string().nullish(),
});

export type CheckIn = z.infer<typeof checkInSchema>;
