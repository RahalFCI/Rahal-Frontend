/**
 * VendorDetail — the vendor-operated place detail (image copy.png). DORMANT: only
 * reached when a place carries a `vendorId`, which the backend has not shipped yet
 * (docs/backend-vendor-place-proposal.md). Geographic data still comes from the
 * `Place`; vendor metadata (name, working hours) comes from the vendor profile.
 * CALL / MENU render disabled (GetVendorDto has no phone/menu).
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Clock, MapPin, Menu, Phone } from 'lucide-react-native';
import { BeaconButton } from '../../../../shared/layout';
import { LabelCaps, Surface, Text } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { usePlacePhotos } from '../../hooks/usePlacePhotos';
import { usePlaceReviews } from '../../hooks/usePlaceReviews';
import { openDirections } from '../../utils/directions';
import type { Place } from '../../api/schemas';
import type { Vendor } from '../../../vendors/api/schemas';
import { DetailHero } from './DetailHero';
import { DetailActionRow, type DetailAction } from './DetailActionRow';
import { DetailSection } from './DetailSection';
import { PhotoGallery } from './PhotoGallery';
import { DetailInfoRow } from './DetailInfoRow';
import { RatingPill } from './RatingPill';

interface VendorDetailProps {
  place: Place;
  vendor: Vendor;
  onClose: () => void;
}

/** Today's working-hours string from a DayOfWeek→hours map, if present. */
function todayHours(workingHours: Vendor['workingHours']): string | null {
  if (!workingHours) return null;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const entry = Object.entries(workingHours).find(
    ([day]) => day.toLowerCase() === today.toLowerCase(),
  );
  return entry?.[1]?.trim() || null;
}

export function VendorDetail({ place, vendor, onClose }: VendorDetailProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['places', 'vendors']);
  const [saved, setSaved] = useState(false);

  const { data: photos } = usePlacePhotos(place.id);
  const { summary } = usePlaceReviews(place.id);

  const photoUrls = photos?.map((p) => p.url) ?? [];
  const heroUrl = photoUrls[0] ?? vendor.profilePictureUrl ?? undefined;

  // Vendor address is a free-text line; the structured parts live on the Place.
  const placeAddress = place.address;
  const addressLine = vendor.address?.trim() || placeAddress?.addressLine?.trim();
  const addressSub = [placeAddress?.city, placeAddress?.government, placeAddress?.country]
    .map((p) => p?.trim())
    .filter((p): p is string => !!p)
    .join(', ');

  const hours = todayHours(vendor.workingHours);

  const navigate = () =>
    openDirections(place.latitude, place.longitude, vendor.displayName, vendor.addressUrl);

  const actions: DetailAction[] = [
    { key: 'map', label: t('vendors:actions.map'), icon: MapPin, onPress: navigate },
    { key: 'call', label: t('places:detail.actions.call'), icon: Phone, disabled: true },
    { key: 'menu', label: t('vendors:actions.menu'), icon: Menu, disabled: true },
    {
      key: 'save',
      label: t('places:detail.actions.save'),
      icon: saved ? BookmarkCheck : Bookmark,
      onPress: () => setSaved((s) => !s),
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <DetailHero imageUrl={heroUrl} onClose={onClose} />

      <View style={styles.content}>
        <View>
          <View style={styles.eyebrowRow}>
            <LabelCaps style={{ color: theme.colors.primary }}>
              {t('vendors:authenticMerchant')}
            </LabelCaps>
            <RatingPill
              average={summary.average}
              count={summary.count}
              countLabel={t('places:detail.reviews')}
            />
          </View>

          <Text variant="headlineLarge" className="mt-[8px]">
            {vendor.displayName}
          </Text>

          <View style={styles.actions}>
            <DetailActionRow actions={actions} />
          </View>
        </View>

        <DetailSection eyebrow={t('vendors:archivistNote')} body={place.description} />

        <PhotoGallery eyebrow={t('vendors:visualArtifacts')} photos={photoUrls} />

        <Surface tone="low" style={styles.infoCard}>
          <DetailInfoRow
            icon={MapPin}
            title={addressLine || t('places:detail.addressUnknown')}
            subtitle={addressSub || undefined}
            disabled={!addressLine && !addressSub}
          />
          <DetailInfoRow
            icon={Clock}
            title={hours || t('places:detail.hoursUnavailable')}
            subtitle={hours ? t('vendors:today') : undefined}
            disabled={!hours}
          />
        </Surface>

        <BeaconButton label={t('vendors:navigateToLocation')} onPress={navigate} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 28,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    marginTop: 20,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
});
