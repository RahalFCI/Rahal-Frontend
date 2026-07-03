/**
 * Feature flags — gate stretch features during demos.
 * All flags default to false; flip in .env or here when a phase is ready.
 */
const mockDataEnv = process.env.EXPO_PUBLIC_MOCK_DATA;
const pushEnv = process.env.EXPO_PUBLIC_PUSH;

export const flags = {
  social: false,
  payment: false,
  /**
   * Notifications feature (in-app center + unread badges + FCM push registration).
   * On by default in dev so the notifications center/badges are demoable; set
   * EXPO_PUBLIC_PUSH="false" to force off, or "true" in any build. Real OS push
   * still requires Firebase config (google-services.json); the in-app center works
   * regardless via polling.
   */
  push: pushEnv === 'true' || (pushEnv !== 'false' && __DEV__),
  /**
   * Serve curated demo places/categories/photos/reviews from local fixtures
   * instead of the backend (src/features/places/fixtures). On by default in dev
   * so the map has relics to render without a seeded backend; set
   * EXPO_PUBLIC_MOCK_DATA="false" to force the real API, or "true" in any build.
   */
  mockData: mockDataEnv === 'true' || (mockDataEnv !== 'false' && __DEV__),
} as const;
