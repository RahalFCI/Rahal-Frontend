/**
 * QuestCard — the marker-tap quick-look. An archival "relic" entry surfaced
 * from the bottom of the map when an Explorer taps a curated place (CLAUDE.md
 * §3.2: gamification reads as a journal entry, not an arcade popup). Composes
 * the shared layout/components primitives; carries no data-fetching of its own.
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { Icon, LabelCaps, Text } from '../../../shared/components';
import { RelicCard } from '../../../shared/layout';
import { useTheme } from '../../../shared/theme';
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
  const { t } = useTranslation('places');
  const anim = useRef(new Animated.Value(0)).current;

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
  const price =
    place.ticketPrice && place.ticketPrice > 0
      ? t('quest.priceValue', { price: place.ticketPrice })
      : t('quest.priceFree');

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
        <View style={styles.headerRow}>
          <LabelCaps style={{ color: theme.colors.primary }}>
            {place.categoryName?.trim() || t('quest.curated')}
          </LabelCaps>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('quest.close')}
            hitSlop={12}
            onPress={onClose}
          >
            <Icon icon={X} size={20} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <Text variant="headlineSmall" className="mt-[4px]" numberOfLines={2}>
          {place.name}
        </Text>

        {location ? (
          <LabelCaps className="mt-[8px]">{location}</LabelCaps>
        ) : null}

        {place.description?.trim() ? (
          <Text variant="bodyMedium" className="text-on-surface-variant mt-[12px]" numberOfLines={2}>
            {place.description}
          </Text>
        ) : null}

        <View style={[styles.footerRow, { borderTopColor: theme.colors.outlineVariant }]}>
          <LabelCaps>{t('quest.entry')}</LabelCaps>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }} className="font-bold">
            {price}
          </Text>
        </View>
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
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
