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
import { checkInEndpoints } from './endpoints';
import type { CheckInRequest } from './schemas';

export async function createCheckIn(explorerId: string, body: CheckInRequest): Promise<string> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: checkInEndpoints.create(explorerId),
    data: body,
  });
  return typeof data === 'string' ? data : '';
}
