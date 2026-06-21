/**
 * useVendor — server state for a single vendor profile. Only fires when a
 * vendorId is present (i.e. a vendor-operated place), so it is dormant for the
 * admin-curated places that make up today's seeded data.
 */
import { useQuery } from '@tanstack/react-query';
import { getVendor } from '../api/vendorsApi';

export const vendorKeys = {
  all: ['vendors'] as const,
  detail: (vendorId: string) => ['vendors', 'detail', vendorId] as const,
};

export function useVendor(vendorId: string | null | undefined) {
  return useQuery({
    queryKey: vendorKeys.detail(vendorId ?? ''),
    queryFn: () => getVendor(vendorId as string),
    enabled: !!vendorId,
  });
}
