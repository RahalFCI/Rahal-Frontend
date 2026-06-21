/**
 * Vendor endpoints (relative to env.API_BASE_URL, which already includes /api).
 * See docs/backend-api-reference.md (VendorProfileController).
 */
export const vendorEndpoints = {
  byId: (vendorId: string) => `/VendorProfile/${vendorId}`,
} as const;
