import { Pressable, View } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { tokens } from '../../../shared/theme';

interface DiscoverSearchBarProps {
  placeholder: string;
  accessibilityLabel: string;
  onPress?: () => void;
}

export function DiscoverSearchBar({
  placeholder,
  accessibilityLabel,
  onPress,
}: DiscoverSearchBarProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="mx-[16px] min-h-[48px] rounded-lg bg-surface-container-lowest px-[14px] flex-row items-center gap-[10px]"
      style={tokens.elevation.ambientShadow}
    >
      <Search size={18} color={tokens.colors.onSurfaceVariant} strokeWidth={1.8} />
      <View className="flex-1">
        <Text variant="bodyMedium" className="text-on-surface-variant" numberOfLines={1}>
          {placeholder}
        </Text>
      </View>
      <SlidersHorizontal size={18} color={tokens.colors.primary} strokeWidth={1.8} />
    </Pressable>
  );
}
