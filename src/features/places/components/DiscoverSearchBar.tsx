/**
 * DiscoverSearchBar — the floating search field over the map (image.png top).
 * A white "relic" pill with a leading search glyph, clearable text, and a
 * trailing filter affordance. Controlled by the Discover screen.
 */
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Icon } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';

interface DiscoverSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Optional trailing filter button press (e.g. open an advanced filter sheet). */
  onFilterPress?: () => void;
}

export function DiscoverSearchBar({ value, onChangeText, onFilterPress }: DiscoverSearchBarProps) {
  const theme = useTheme();
  const { t } = useTranslation('places');

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.field,
          theme.elevation.ambientShadow,
          { backgroundColor: theme.colors.surfaceContainerLowest },
        ]}
      >
        <Icon icon={Search} size={20} color={theme.colors.onSurfaceVariant} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          returnKeyType="search"
          style={[styles.input, { color: theme.colors.onSurface }]}
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('search.clear')}
            hitSlop={10}
            onPress={() => onChangeText('')}
          >
            <Icon icon={X} size={18} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('search.filters')}
        onPress={onFilterPress}
        style={[
          styles.filterButton,
          theme.elevation.ambientShadow,
          { backgroundColor: theme.colors.surfaceContainerLowest },
        ]}
      >
        <Icon icon={SlidersHorizontal} size={20} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceGrotesk',
    fontSize: 16,
    padding: 0,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
