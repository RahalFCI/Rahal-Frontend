/**
 * PlaceDetail — the admin-curated relic detail (image copy 2.png). The active
 * detail variant for all of today's places. CALL / WEBSITE / Opening Hours render
 * disabled because GetPlaceDto carries no phone/website/hours; NAVIGATE works off
 * the place coordinates and SAVE is a local bookmark stub.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Clock, Globe, MapPin, Navigation, Phone } from 'lucide-react-native';
import { LabelCaps, Surface, Text } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';
import { useCategories } from '../../hooks/useCategories';
import { usePlacePhotos } from '../../hooks/usePlacePhotos';
import { usePlaceReviews } from '../../hooks/usePlaceReviews';
import { openDirections } from '../../utils/directions';
import type { Place } from '../../api/schemas';
import { DetailHero } from './DetailHero';
import { DetailActionRow, type DetailAction } from './DetailActionRow';
import { DetailSection } from './DetailSection';
import { PhotoGallery } from './PhotoGallery';
import { DetailInfoRow } from './DetailInfoRow';
import { RatingPill } from './RatingPill';

interface PlaceDetailProps {
  place: Place;
  onClose: () => void;
  children?: ReactNode;
}

export function PlaceDetail({ place, onClose, children }: PlaceDetailProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('places');
  const [saved, setSaved] = useState(false);

  const { data: photos } = usePlacePhotos(place.id);
  const { summary } = usePlaceReviews(place.id);
  const { data: categories } = useCategories();

  const photoUrls = photos?.map((p) => p.url) ?? [];
  const categoryName =
    place.categoryName?.trim() ||
    categories?.find((c) => c.id === place.placeCategoryId)?.name ||
    t('quest.curated');

  const addressLine = place.address?.addressLine?.trim();
  const addressSub = [place.address?.city, place.address?.government, place.address?.country]
    .map((p) => p?.trim())
    .filter((p): p is string => !!p)
    .join(', ');

  const actions: DetailAction[] = [
    {
      key: 'navigate',
      label: t('detail.actions.navigate'),
      icon: Navigation,
      onPress: () => openDirections(place.latitude, place.longitude, place.name),
    },
    { key: 'call', label: t('detail.actions.call'), icon: Phone, disabled: true },
    { key: 'website', label: t('detail.actions.website'), icon: Globe, disabled: true },
    {
      key: 'save',
      label: t('detail.actions.save'),
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
      <DetailHero imageUrl={photoUrls[0]} onClose={onClose} />

      <View style={styles.content}>
        <View>
          <View style={styles.eyebrowRow}>
            <LabelCaps style={{ color: theme.colors.primary }}>{categoryName}</LabelCaps>
            <RatingPill
              average={summary.average}
              count={summary.count}
              countLabel={t('detail.explorers')}
            />
          </View>

          <Text variant="headlineLarge" className="mt-[8px]">
            {place.name}
          </Text>

          <View style={styles.actions}>
            <DetailActionRow actions={actions} />
          </View>
        </View>

        <DetailSection eyebrow={t('detail.narrative')} body={place.description} />

        <PhotoGallery eyebrow={t('detail.visualArchive')} photos={photoUrls} />

        {children}

        <Surface tone="low" style={styles.infoCard}>
          <DetailInfoRow
            icon={MapPin}
            title={addressLine || t('detail.addressUnknown')}
            subtitle={addressSub || undefined}
            disabled={!addressLine && !addressSub}
          />
          <DetailInfoRow icon={Clock} title={t('detail.hoursUnavailable')} disabled />
        </Surface>
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
