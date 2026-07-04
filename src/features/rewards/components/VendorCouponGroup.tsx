/**
 * VendorCouponGroup — a vendor's section in the coupon catalog: a header (logo, name,
 * location) sitting on the base surface, with the vendor's coupons beneath. Editorial,
 * borderless — separation is tonal (§3.2/§3.3). The vendor may still be resolving
 * (`useCouponsByVendor` fetches profiles in parallel), so it degrades to a placeholder.
 */
import { View, Image, Pressable } from 'react-native';
import { ChevronRight, Store } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';
import { CouponCard } from './CouponCard';
import type { VendorGroup } from '../hooks/useCouponsByVendor';

export interface VendorCouponGroupProps {
  group: VendorGroup;
  onSelectCoupon: (couponId: string) => void;
  /** Tapping the vendor header opens the vendor detail (absent for the Rahal bucket). */
  onSelectVendor?: (vendorId: string) => void;
}

/** The vendor's free-text address line, if present. */
function locationLine(group: VendorGroup): string | null {
  const addr = group.vendor?.address?.trim();
  return addr ? addr : null;
}

export function VendorCouponGroup({
  group,
  onSelectCoupon,
  onSelectVendor,
}: VendorCouponGroupProps) {
  const { t } = useTranslation('rewards');
  const name =
    group.vendor?.displayName ??
    (group.vendorId == null ? t('catalog.rahalVendor') : t('catalog.vendorFallback'));
  const logo = group.vendor?.profilePictureUrl;
  const location = locationLine(group);
  // Only real vendors are tappable — the Rahal-curated bucket has no vendor page.
  const tappable = group.vendorId != null && onSelectVendor != null;

  const header = (
    <View className="flex-row items-center gap-[12px] px-[24px]">
      {logo ? (
        <Image
          source={{ uri: logo }}
          className="w-[44px] h-[44px] rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-[44px] h-[44px] rounded-xl items-center justify-center bg-surface-container-high">
          <Store size={22} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
        </View>
      )}
      <View className="flex-1 gap-[2px]">
        <Text variant="bodyLarge" className="font-bold text-on-surface">
          {name}
        </Text>
        {location ? (
          <LabelCaps className="text-on-surface-variant">{location}</LabelCaps>
        ) : (
          <LabelCaps className="text-on-surface-variant">
            {t('catalog.couponCount', { count: group.coupons.length })}
          </LabelCaps>
        )}
      </View>
      {tappable ? (
        <ChevronRight size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
      ) : null}
    </View>
  );

  return (
    <View className="gap-[12px]">
      {/* Vendor header — taps through to the vendor detail */}
      {tappable ? (
        <Pressable
          onPress={() => onSelectVendor(group.vendorId as string)}
          accessibilityRole="button"
          accessibilityLabel={name}
        >
          {header}
        </Pressable>
      ) : (
        header
      )}

      {/* Vendor's coupons */}
      <View className="px-[24px] gap-[12px]">
        {group.coupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            onPress={() => onSelectCoupon(coupon.id)}
          />
        ))}
      </View>
    </View>
  );
}
