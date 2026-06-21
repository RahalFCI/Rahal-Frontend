/**
 * Place photos API. Anonymous (publicApiClient). Relative `/uploads/...` urls are
 * resolved against env.MEDIA_BASE_URL so consumers always get an absolute uri.
 */
import { publicApiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { env } from '../../../config/env';
import { placeEndpoints } from './endpoints';
import { placePhotosSchema, type PlacePhoto } from './schemas';

/** Resolves a (possibly relative) media url to an absolute one. */
export function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function getPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
  const data = await publicApiClient<unknown>({
    method: 'GET',
    url: placeEndpoints.photos(placeId),
  });
  const photos = zodParse(placePhotosSchema, data);
  return photos.map((photo) => ({ ...photo, url: resolveMediaUrl(photo.url) }));
}
