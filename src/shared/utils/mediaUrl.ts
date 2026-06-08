import { env } from '../../config/env';

/**
 * Converts a relative media path from the backend (e.g. /uploads/photo.jpg)
 * to an absolute URL that React Native's Image component can load.
 * Absolute URLs are returned unchanged.
 */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${env.MEDIA_BASE_URL}${path}`;
}
