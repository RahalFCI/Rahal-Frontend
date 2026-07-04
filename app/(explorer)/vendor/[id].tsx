/**
 * Vendor detail route — reached by tapping a vendor in the coupon catalog or on a
 * coupon detail. Gives the vendor a face and a place: logo, address (with open-in-
 * maps), today's hours, and the coupons they offer. Vendors carry no lat/long, so
 * the map link resolves via `addressUrl` / a maps text search (see vendors/utils).
 * Editorial treatment mirrors the place card. Hidden from the tab bar via `href: null`.
 */
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Clock, MapPin, Store } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { LabelCaps } from '../../../src/shared/components/LabelCaps';
import { BeaconButton } from '../../../src/shared/layout/BeaconButton';
import { tokens } from '../../../src/shared/theme';
import { useVendor } from '../../../src/features/vendors/hooks/useVendor';
import { openVendorLocation, todayHours } from '../../../src/features/vendors/utils/location';
import { useCoupons } from '../../../src/features/rewards/hooks/useCoupons';
import { CouponCard } from '../../../src/features/rewards/components/CouponCard';

export default function VendorDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation(['vendors', 'rewards']);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: vendor, isLoading, isError } = useVendor(id);
  const { coupons } = useCoupons();
  const vendorCoupons = coupons.filter((c) => c.vendorId === id);

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace('/(explorer)/rewards');

  if (isLoading && !vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={tokens.colors.primary} />
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <Surface tone="base" className="flex-1">
        <SafeAreaView className="flex-1 items-center justify-center px-[24px]">
          <Text variant="bodyLarge" className="text-on-surface-variant text-center">
            {t('vendors:notFound')}
          </Text>
        </SafeAreaView>
      </Surface>
    );
  }

  const address = vendor.address?.trim();
  const hours = todayHours(vendor.workingHours);
  const navigate = () => openVendorLocation(vendor.addressUrl, address, vendor.displayName);

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-[16px] py-[12px]">
          <Pressable
            onPress={goBack}
            className="p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('rewards:common.back')}
          >
            <ChevronLeft size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-[40px] gap-[24px]">
          {/* Identity */}
          <View className="items-start gap-[16px]">
            {vendor.profilePictureUrl ? (
              <Image
                source={{ uri: vendor.profilePictureUrl }}
                className="w-[72px] h-[72px] rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-[72px] h-[72px] rounded-xl items-center justify-center bg-surface-container-high">
                <Store size={32} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
              </View>
            )}
            <View className="gap-[6px]">
              <LabelCaps className="text-primary">{t('vendors:authenticMerchant')}</LabelCaps>
              <Text variant="headlineLarge" className="text-on-surface">
                {vendor.displayName}
              </Text>
            </View>
          </View>

          {/* Location + hours */}
          <Surface tone="lowest" className="p-[16px] rounded-lg gap-[16px]">
            <View className="flex-row items-start gap-[12px]">
              <MapPin size={18} color={tokens.colors.primary} strokeWidth={1.75} />
              <View className="flex-1 gap-[2px]">
                <LabelCaps className="text-on-surface-variant">{t('vendors:location')}</LabelCaps>
                <Text variant="bodyLarge" className="text-on-surface">
                  {address || t('vendors:locationUnknown')}
                </Text>
              </View>
            </View>
            <View className="flex-row items-start gap-[12px]">
              <Clock size={18} color={tokens.colors.primary} strokeWidth={1.75} />
              <View className="flex-1 gap-[2px]">
                <LabelCaps className="text-on-surface-variant">{t('vendors:today')}</LabelCaps>
                <Text variant="bodyLarge" className="text-on-surface">
                  {hours || t('vendors:hoursUnavailable')}
                </Text>
              </View>
            </View>
          </Surface>

          <BeaconButton label={t('vendors:navigateToLocation')} onPress={navigate} />

          {/* Coupons offered here */}
          {vendorCoupons.length > 0 ? (
            <View className="gap-[12px]">
              <LabelCaps className="text-on-surface-variant">
                {t('vendors:couponsHere', { count: vendorCoupons.length })}
              </LabelCaps>
              {vendorCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onPress={() =>
                    router.push({ pathname: '/(explorer)/coupon/[id]', params: { id: coupon.id } })
                  }
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
