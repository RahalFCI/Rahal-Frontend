/**
 * useCouponsByVendor — the vendor catalog data source. Takes the active coupon
 * catalog (`useCoupons`) and groups it by `vendorId`, resolving each distinct
 * vendor's profile (`getVendor`) so the catalog can render vendor-headed sections
 * (name, logo, address). `GetCouponDto` only carries `vendorId`, so names are
 * resolved client-side; `GET /VendorProfile/{id}` is `[Authorize]` (explorer-
 * accessible). Vendor lookups run in parallel via `useQueries` and are cached
 * under `vendorKeys.detail`, shared with the coupon detail screen.
 */
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getVendor } from '../../vendors/api/vendorsApi';
import { vendorKeys } from '../../vendors/hooks/useVendor';
import type { Vendor } from '../../vendors/api/schemas';
import { useCoupons } from './useCoupons';
import type { Coupon } from '../api/schemas';

export interface VendorGroup {
  /** Null for coupons without a vendor (admin/Rahal-curated). */
  vendorId: string | null;
  vendor: Vendor | undefined;
  vendorLoading: boolean;
  coupons: Coupon[];
}

export function useCouponsByVendor() {
  const { coupons, isLoading, isError, refetch } = useCoupons();

  // Distinct, defined vendor ids drive the parallel profile lookups.
  const vendorIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of coupons) {
      if (c.vendorId) ids.add(c.vendorId);
    }
    return [...ids];
  }, [coupons]);

  const vendorQueries = useQueries({
    queries: vendorIds.map((vendorId) => ({
      queryKey: vendorKeys.detail(vendorId),
      queryFn: () => getVendor(vendorId),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const groups = useMemo<VendorGroup[]>(() => {
    const byVendor = new Map<string | null, Coupon[]>();
    for (const c of coupons) {
      const key = c.vendorId ?? null;
      const list = byVendor.get(key);
      if (list) list.push(c);
      else byVendor.set(key, [c]);
    }

    const vendorById = new Map<string, { vendor: Vendor | undefined; loading: boolean }>();
    vendorIds.forEach((id, i) => {
      vendorById.set(id, {
        vendor: vendorQueries[i]?.data,
        loading: vendorQueries[i]?.isLoading ?? false,
      });
    });

    // Named vendors first (alphabetical), the vendor-less bucket last.
    return [...byVendor.entries()]
      .map(([vendorId, groupCoupons]) => {
        const resolved = vendorId ? vendorById.get(vendorId) : undefined;
        return {
          vendorId,
          vendor: resolved?.vendor,
          vendorLoading: resolved?.loading ?? false,
          coupons: groupCoupons,
        };
      })
      .sort((a, b) => {
        if (a.vendorId === null) return 1;
        if (b.vendorId === null) return -1;
        const an = a.vendor?.displayName ?? '';
        const bn = b.vendor?.displayName ?? '';
        return an.localeCompare(bn);
      });
  }, [coupons, vendorIds, vendorQueries]);

  return { groups, isLoading, isError, refetch };
}
