/**
 * Media API — Cloudinary signed direct upload (the file never touches our server).
 * Flow (docs/social/02-backend-api-contract.md §Media):
 *   1. POST /Media/signatures with the media types → signed credentials.
 *   2. Upload each file DIRECTLY to Cloudinary with exactly the signed params.
 *   3. Pass the returned public_ids as `mediaIds` to POST /posts.
 * Verified end-to-end in A3 (signed upload → post → delivery URL 200).
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { mediaEndpoints } from './endpoints';
import {
  uploadSignaturesSchema,
  MediaTypeEnum,
  type UploadSignatureItem,
  type MediaTypeValue,
} from './schemas';

export async function getUploadSignatures(
  fileTypes: MediaTypeValue[],
): Promise<UploadSignatureItem[]> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: mediaEndpoints.signatures,
    data: { items: fileTypes.map((fileType) => ({ fileType })) },
  });
  return zodParse(uploadSignaturesSchema, data).signatures;
}

export interface LocalMedia {
  uri: string;
  /** MIME type from the picker (e.g. image/jpeg). Defaults to image/jpeg. */
  mimeType?: string;
  fileType: MediaTypeValue;
}

/**
 * Uploads one local file to Cloudinary using a pre-signed credential and returns the
 * public_id (to be sent to the backend as a mediaId). React Native FormData handles
 * the multipart body — the file is described as { uri, name, type }.
 */
export async function uploadToCloudinary(
  sig: UploadSignatureItem,
  media: LocalMedia,
): Promise<string> {
  const resourceType = media.fileType === MediaTypeEnum.Video ? 'video' : 'image';
  const mime = media.mimeType ?? 'image/jpeg';
  const ext = mime.split('/')[1] ?? 'jpg';

  const form = new FormData();
  // RN file shape — cast through unknown because the DOM FormData type expects Blob.
  form.append('file', { uri: media.uri, name: `upload.${ext}`, type: mime } as unknown as Blob);
  form.append('public_id', sig.publicId);
  form.append('timestamp', String(sig.timestamp));
  form.append('api_key', sig.apiKey);
  form.append('signature', sig.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${text}`);
  }

  return sig.publicId;
}

/**
 * Convenience: sign + upload a batch of local media, returning their public_ids in
 * order. Backend caps a post at 3 media items.
 */
export async function uploadMediaBatch(media: LocalMedia[]): Promise<string[]> {
  if (media.length === 0) return [];
  const signatures = await getUploadSignatures(media.map((m) => m.fileType));
  const ids: string[] = [];
  for (let i = 0; i < media.length; i += 1) {
    ids.push(await uploadToCloudinary(signatures[i], media[i]));
  }
  return ids;
}
