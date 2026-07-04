/**
 * CheckInChallenge API — the challenge-attempt flow (Explorer-gated).
 *
 * Attempting a challenge is two backend calls (a check-in is a prerequisite):
 *   1. POST /CheckInChallenge  { challengeId, checkInId }  → links a check-in to a
 *      challenge, creating a `Pending` GetCheckInChallengeDto.
 *   2. POST /CheckInChallenge/{id}/validate  (multipart, field `image`) → the
 *      backend forwards the photo to the AI `/verify` service, sets Approved/Rejected,
 *      awards XP on approval, and returns a bare boolean verdict (ApiResponse<bool>).
 *
 * The `{id}` on validate is the CheckInChallenge id from step 1, NOT the challenge id.
 */
import { apiClient } from '../../../shared/api/client';
import { ApiError, resolveErrorCode, zodParse } from '../../../shared/api';
import { env } from '../../../config/env';
import { useAuthStore } from '../../auth/store/authStore';
import { checkInChallengeEndpoints } from './endpoints';
import {
  checkInChallengeSchema,
  pagedCheckInChallengesSchema,
  type CheckInChallenge,
} from './schemas';

/** A locally captured/picked photo to submit as challenge proof. */
export interface AttemptMedia {
  uri: string;
  /** MIME type from the picker (e.g. image/jpeg). Defaults to image/jpeg. */
  mimeType?: string;
}

export interface CreateCheckInChallengeParams {
  challengeId: string;
  checkInId: string;
}

export async function createCheckInChallenge({
  challengeId,
  checkInId,
}: CreateCheckInChallengeParams): Promise<CheckInChallenge> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: checkInChallengeEndpoints.create,
    data: { challengeId, checkInId },
  });
  return zodParse(checkInChallengeSchema, data);
}

/**
 * Uploads the proof photo and returns the AI verdict (true = approved & XP awarded,
 * false = rejected). Sent as multipart/form-data with the field name `image`, matching
 * the backend `[FromForm] IFormFile image`.
 *
 * Uses `fetch` (not the axios apiClient) on purpose — like `social/api/mediaApi.ts`.
 * With React Native FormData you must NOT set `Content-Type`: the RN networking layer
 * generates the `multipart/form-data; boundary=…` header itself, and setting it by hand
 * (axios does, or an explicit header) sends it without the boundary, so the server can't
 * parse the `image` part. The Bearer token is attached manually since we bypass the
 * axios request interceptor. Envelope-unwrapped/typed-error like apiClient.
 */
export async function validateCheckInChallenge(
  checkInChallengeId: string,
  media: AttemptMedia,
): Promise<boolean> {
  const mime = media.mimeType ?? 'image/jpeg';
  const ext = mime.split('/')[1] ?? 'jpg';

  const form = new FormData();
  // RN file shape — cast through unknown because the DOM FormData type expects Blob.
  form.append('image', { uri: media.uri, name: `proof.${ext}`, type: mime } as unknown as Blob);

  const token = useAuthStore.getState().accessToken;
  let res: Response;
  try {
    res = await fetch(`${env.API_BASE_URL}${checkInChallengeEndpoints.validate(checkInChallengeId)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });
  } catch {
    throw new ApiError('NETWORK', 'Network request failed', 0);
  }

  const body = (await res.json().catch(() => undefined)) as
    | { isSuccess?: boolean; data?: boolean; errorCode?: number | string }
    | undefined;

  if (res.ok && body?.isSuccess) {
    return body.data === true;
  }
  throw new ApiError(resolveErrorCode(res.status, body?.errorCode), 'Validate failed', res.status);
}

/** The explorer's attempts tied to a single check-in (used to resolve per-challenge state). */
export async function getCheckInChallengesForCheckIn(
  checkInId: string,
  { page = 1, pageSize = 50 }: { page?: number; pageSize?: number } = {},
): Promise<CheckInChallenge[]> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: checkInChallengeEndpoints.forCheckIn(checkInId),
    params: { page, pageSize },
  });
  return zodParse(pagedCheckInChallengesSchema, data).items;
}
