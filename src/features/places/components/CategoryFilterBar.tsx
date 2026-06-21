/**
 * CategoryFilterBar — horizontally scrollable category chips over the map
 * (image.png). Selecting a chip filters the map server-side via
 * `/Place/category/{id}`; tapping the active chip clears the filter.
 */
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import {
  Landmark,
  UtensilsCrossed,
  Footprints,
  Tag,
  type LucideIcon,
} from 'lucide-react-native';
import { Icon, Text } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import type { PlaceCategory } from '../api/schemas';

interface CategoryFilterBarProps {
  categories: PlaceCategory[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}

/** Best-effort glyph for a category by name; falls back to a generic tag. */
function iconForCategory(name: string): LucideIcon {
  const key = name.toLowerCase();
  if (/(histor|monument|museum|relic|herit)/.test(key)) return Landmark;
  if (/(food|cafe|restaurant|dining|eat|drink)/.test(key)) return UtensilsCrossed;
  if (/(activ|adventure|tour|experience|sport)/.test(key)) return Footprints;
  return Tag;
}

export function CategoryFilterBar({ categories, selectedId, onSelect }: CategoryFilterBarProps) {
  const theme = useTheme();

  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        const ChipIcon = iconForCategory(category.name);
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(isSelected ? null : category.id)}
            style={[
              styles.chip,
              theme.elevation.ambientShadow,
              {
                backgroundColor: isSelected
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceContainerLowest,
              },
            ]}
          >
            <Icon
              icon={ChipIcon}
              size={16}
              color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
              strokeWidth={isSelected ? 2 : 1.6}
            />
            <Text
              variant="labelMedium"
              className={isSelected ? 'text-primary' : 'text-on-surface'}
              style={{ marginLeft: 6 }}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 2,
    paddingRight: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
  },
});
