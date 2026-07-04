/**
 * Zod schemas for Vendor responses — mirrors GetVendorDto from
 * docs/backend-api-reference.md. Validated at the client boundary (CLAUDE.md §2.3).
 */
import { z } from 'zod';

export const vendorSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  profilePictureUrl: z.string().nullish(),
  countryCode: z.string().nullish(),
  /** GetVendorDto.Address is a single free-text line (e.g. "Zamalek, Cairo"). */
  address: z.string().nullish(),
  addressUrl: z.string().nullish(),
  /** Map of DayOfWeek → "HH:mm-HH:mm" (or similar). Shape is backend-defined. */
  workingHours: z.record(z.string(), z.string()).nullish(),
  categoryId: z.string().nullish(),
  isApproved: z.boolean().nullish(),
});

export type Vendor = z.infer<typeof vendorSchema>;
