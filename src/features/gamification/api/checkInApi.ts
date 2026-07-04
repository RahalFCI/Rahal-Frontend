/**
 * Check-in API. `POST /CheckIn/{explorerId}` is Explorer-gated, so it uses the
 * authenticated apiClient. The backend runs geo validation and may reject with
 * AlreadyCheckedIn / UserNotAtLocation / ImpossibleTravel / LocationSpoofingDetected
 * (mapped to the front-end error taxonomy in shared/api/errors.ts).
 *
 * NOTE: on success the backend returns `ApiResponse<string>` whose `data` is a
 * plain message ("Checked in successfully") — NOT a GetCheckInDto. XP and stats
 * are awarded asynchronously by a downstream consumer, so the response carries
 * no XP/place payload. Callers derive the place name from the place they acted on.
 */
import { apiClient } from '../../../shared/api/client';
import { ApiError, zodParse } from '../../../shared/api';
import { checkInEndpoints } from './endpoints';
import { checkInSchema, type CheckIn, type CheckInRequest } from './schemas';

export async function createCheckIn(explorerId: string, body: CheckInRequest): Promise<string> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: checkInEndpoints.create(explorerId),
    data: body,
  });
  return typeof data === 'string' ? data : '';
}

/**
 * The explorer's check-in at a single place (existence/status probe), or `null`
 * when they haven't checked in there (backend 404). The returned `checkInId` is
 * what the challenge-attempt flow links against.
 */
export async function getCheckInForPlace(
  explorerId: string,
  placeId: string,
): Promise<CheckIn | null> {
  try {
    const data = await apiClient<unknown>({
      method: 'GET',
      url: checkInEndpoints.forPlace(explorerId, placeId),
    });
    return zodParse(checkInSchema, data);
  } catch (error) {
    if (error instanceof ApiError && error.code === 'NOT_FOUND') return null;
    throw error;
  }
}
