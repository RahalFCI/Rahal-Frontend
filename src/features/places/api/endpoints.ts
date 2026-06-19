/**
 * Place endpoints (relative to env.API_BASE_URL, which already includes /api).
 * See docs/backend-api-reference.md (PlaceController).
 */
export const placeEndpoints = {
  list: '/Place',
  byId: (id: string) => `/Place/${id}`,
  byCategory: (categoryId: string) => `/Place/category/${categoryId}`,
  /** ⚠ binds [FromQuery] despite being POST — pass params via query string. */
  search: '/Place/search',
} as const;
