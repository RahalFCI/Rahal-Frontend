/**
 * Place detail route. Resolves the place by id, then branches: a place carrying a
 * `vendorId` renders the vendor variant (dormant until the backend ships the
 * field — docs/backend-vendor-place-proposal.md), everything else renders the
 * admin-curated place variant. Hidden from the tab bar via `href: null`.
 */
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../src/shared/components';
import { useTheme } from '../../../src/shared/theme';
import { usePlace } from '../../../src/features/places/hooks/usePlace';
import { PlaceDetail } from '../../../src/features/places/components/detail/PlaceDetail';
import { VendorDetail } from '../../../src/features/places/components/detail/VendorDetail';
import { useVendor } from '../../../src/features/vendors/hooks/useVendor';

export default function PlaceDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('places');
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: place, isLoading, isError } = usePlace(id);
  const vendorQuery = useVendor(place?.vendorId);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(explorer)'));

  if (isLoading && !place) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !place) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-[24px]">
        <Text variant="bodyLarge" className="text-on-surface-variant text-center">
          {t('detail.notFound')}
        </Text>
      </View>
    );
  }

  if (place.vendorId && vendorQuery.data) {
    return <VendorDetail place={place} vendor={vendorQuery.data} onClose={close} />;
  }

  return <PlaceDetail place={place} onClose={close} />;
}
