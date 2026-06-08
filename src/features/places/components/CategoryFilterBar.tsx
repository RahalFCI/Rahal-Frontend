import { Pressable, ScrollView, View } from 'react-native';
import { Compass } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { tokens } from '../../../shared/theme';
import type { PlaceCategoryDto } from '../types';

interface CategoryFilterBarProps {
  categories: PlaceCategoryDto[];
  selectedId: string | null;
  allLabel: string;
  onSelect: (id: string | null) => void;
}

export function CategoryFilterBar({
  categories,
  selectedId,
  allLabel,
  onSelect,
}: CategoryFilterBarProps) {
  const options = [
    { id: null, name: allLabel },
    ...categories.map((category) => ({ id: category.id, name: category.name })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {options.map((option) => {
        const isActive = option.id === selectedId;
        return (
          <Pressable
            key={option.id ?? 'all'}
            onPress={() => onSelect(option.id)}
            className={`min-h-[40px] rounded-lg px-[14px] flex-row items-center gap-[6px] ${
              isActive ? 'bg-primary' : 'bg-surface-container-lowest'
            }`}
            style={!isActive ? tokens.elevation.ambientShadow : undefined}
          >
            <Compass
              size={14}
              color={isActive ? tokens.colors.onPrimary : tokens.colors.primary}
              strokeWidth={1.8}
            />
            <Text
              variant="labelMedium"
              className={isActive ? 'text-on-primary font-bold' : 'text-on-surface'}
              numberOfLines={1}
            >
              {option.name}
            </Text>
          </Pressable>
        );
      })}
      <View className="w-[8px]" />
    </ScrollView>
  );
}
