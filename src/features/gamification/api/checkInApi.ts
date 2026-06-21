/**
 * Check-in API. `POST /CheckIn/{explorerId}` is Explorer-gated, so it uses the
 * authenticated apiClient. The backend runs geo validation and may reject with
 * AlreadyCheckedIn / UserNotAtLocation / ImpossibleTravel / LocationSpoofingDetected
 * (mapped to the front-end error taxonomy in shared/api/errors.ts).
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { checkInEndpoints } from './endpoints';
import { checkInSchema, type CheckIn, type CheckInRequest } from './schemas';

export async function createCheckIn(explorerId: string, body: CheckInRequest): Promise<CheckIn> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: checkInEndpoints.create(explorerId),
    data: body,
  });
  return zodParse(checkInSchema, data);
}
