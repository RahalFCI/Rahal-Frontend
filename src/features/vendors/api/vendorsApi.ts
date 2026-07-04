/**
 * Vendors API. `GET /VendorProfile/{id}` is `[Authorize]` (any authenticated role,
 * including Explorer), so this uses the authenticated apiClient. Used by the coupon
 * catalog to resolve each coupon's `vendorId` into a display name/logo/address
 * (`useCouponsByVendor`), and by the place detail screen for vendor-operated places.
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { vendorEndpoints } from './endpoints';
import { vendorSchema, type Vendor } from './schemas';

export async function getVendor(vendorId: string): Promise<Vendor> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: vendorEndpoints.byId(vendorId),
  });
  return zodParse(vendorSchema, data);
}
