/**
 * QuestCard — the marker-tap quick-look. An archival "relic" entry surfaced from
 * the bottom of the map when an Explorer taps a curated place (CLAUDE.md §3.2:
 * gamification reads as a journal entry, not an arcade popup). Tapping the body
 * opens the full detail screen; non-vendor relics also expose a check-in action
 * (the Phase 3 centerpiece). The map background tap dismisses it.
 */
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ChevronRight, ImageOff, MapPin } from 'lucide-react-native';
import { Icon, LabelCaps, Text } from '../../../shared/components';
import { RelicCard } from '../../../shared/layout';
import { useTheme } from '../../../shared/theme';
import { useCheckIn } from '../../gamification/hooks/useCheckIn';
import { usePlacePhotos } from '../hooks/usePlacePhotos';
import type { Place } from '../api/schemas';

interface QuestCardProps {
  place: Place;
  onClose: () => void;
}

/** Joins non-empty, non-duplicate address parts into a single catalog line. */
function formatLocation(place: Place): string {
  const parts = [place.address?.city, place.address?.government]
    .map((p) => p?.trim())
    .filter((p): p is string => !!p);
  return Array.from(new Set(parts)).join(' · ');
}

export function QuestCard({ place, onClose }: QuestCardProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation('places');
  const anim = useRef(new Animated.Value(0)).current;
  const { data: photos } = usePlacePhotos(place.id);
  const thumbnail = photos?.[0]?.url;
  const checkIn = useCheckIn();

  // Slide-and-fade up on mount and whenever the selected place changes.
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [place.id, anim]);

  const location = formatLocation(place);
  const eyebrow = place.categoryName?.trim() || t('quest.curated');
  // Vendor-operated relics check in through the vendor flow, not here (§ user note).
  const canCheckIn = !place.vendorId;

  function openDetail() {
    onClose();
    router.push({ pathname: '/(explorer)/place/[id]', params: { id: place.id } });
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          // Sit just above the floating Archivist bar (bottom:16 + ~56 + safe area).
          bottom: insets.bottom + 88,
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
          ],
        },
      ]}
    >
      <RelicCard style={[styles.card, theme.elevation.ambientShadow]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('quest.viewDetails', { name: place.name })}
          onPress={openDetail}
        >
          <View style={styles.row}>
            <View
              style={[styles.thumb, { backgroundColor: theme.colors.surfaceContainerHigh }]}
            >
              {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.thumbImage} resizeMode="cover" />
              ) : (
                <Icon icon={ImageOff} size={22} color={theme.colors.onSurfaceVariant} />
              )}
            </View>

            <View style={styles.body}>
              <LabelCaps style={{ color: theme.colors.primary }} numberOfLines={1}>
                {eyebrow}
              </LabelCaps>
              <Text variant="headlineSmall" className="mt-[2px]" numberOfLines={1}>
                {place.name}
              </Text>
              {location ? (
                <Text
                  variant="bodyMedium"
                  className="text-on-surface-variant mt-[2px]"
                  numberOfLines={1}
                >
                  {location}
                </Text>
              ) : null}
            </View>

            <View
              style={[styles.chevron, { backgroundColor: theme.colors.surfaceContainerHigh }]}
              pointerEvents="none"
            >
              <Icon icon={ChevronRight} size={22} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
            </View>
          </View>
        </Pressable>

        {canCheckIn ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('checkIn.action', { name: place.name })}
            accessibilityState={{ disabled: checkIn.isPending }}
            disabled={checkIn.isPending}
            onPress={() => checkIn.mutate({ placeId: place.id, placeName: place.name })}
            android_ripple={{ color: theme.colors.onPrimary }}
            // NOTE: a static style array is required here. A callback style
            // (`({ pressed }) => [...]`) renders nothing under the New Architecture
            // (Fabric) in this RN version — the Pressable silently lays out empty.
            style={[
              styles.checkInButton,
              { backgroundColor: theme.colors.primary, opacity: checkIn.isPending ? 0.7 : 1 },
            ]}
          >
            {checkIn.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Icon icon={MapPin} size={18} color={theme.colors.onPrimary} strokeWidth={2} />
            )}
            <Text variant="bodyLarge" className="font-bold" style={{ color: theme.colors.onPrimary }}>
              {checkIn.isPending ? t('checkIn.pending') : t('checkIn.label')}
            </Text>
          </Pressable>
        ) : null}
      </RelicCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  card: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginTop: 12,
  },
});
