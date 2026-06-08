/**
 * Feature flags — gate stretch features during demos.
 * All flags default to false; flip in .env or here when a phase is ready.
 */
export const flags = {
  social: false,
  payment: false,
  push: false,
} as const;
