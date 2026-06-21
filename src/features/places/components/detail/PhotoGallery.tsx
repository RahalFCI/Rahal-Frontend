/**
 * PhotoGallery — "VISUAL ARCHIVE" / "VISUAL ARTIFACTS" horizontal strip of place
 * photos with an optional "VIEW ALL" affordance (image copy*.png).
 */
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LabelCaps } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface PhotoGalleryProps {
  eyebrow: string;
  photos: string[];
  onViewAll?: () => void;
}

export function PhotoGallery({ eyebrow, photos, onViewAll }: PhotoGalleryProps) {
  const theme = useTheme();
  const { t } = useTranslation('places');

  if (photos.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <LabelCaps className="text-on-surface-variant">{eyebrow}</LabelCaps>
        {photos.length > 1 ? (
          <Pressable accessibilityRole="button" onPress={onViewAll} hitSlop={8}>
            <LabelCaps style={{ color: theme.colors.primary }}>{t('detail.viewAll')}</LabelCaps>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {photos.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={[styles.thumb, { backgroundColor: theme.colors.surfaceContainerHigh }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
  thumb: {
    width: 160,
    height: 110,
    borderRadius: 8,
  },
});
