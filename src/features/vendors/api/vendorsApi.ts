/**
 * Vendors API. `GET /VendorProfile/{id}` is Vendor/Admin-gated, so this uses the
 * authenticated apiClient. Dormant until the backend ships `Place.VendorId`
 * (docs/backend-vendor-place-proposal.md) — see the place detail screen.
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
