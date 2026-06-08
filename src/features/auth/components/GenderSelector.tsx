/**
 * GenderSelector — Two-option pill toggle (Male/Female).
 * Built from design primitives, no external library.
 */
import { View, Pressable } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { FieldError } from '../../../shared/components/FieldError';

interface GenderSelectorProps {
  label?: string;
  value: string | undefined;
  onChange: (value: '1' | '2') => void;
  error?: string;
  maleLabel: string;
  femaleLabel: string;
}

export function GenderSelector({
  label,
  value,
  onChange,
  error,
  maleLabel,
  femaleLabel,
}: GenderSelectorProps) {
  return (
    <View className="gap-[4px]">
      {label && <LabelCaps>{label}</LabelCaps>}
      <View className="flex-row gap-[8px]">
        <Pressable
          onPress={() => onChange('1')}
          className={`flex-1 rounded-sm py-[12px] items-center ${
            value === '1' ? 'bg-primary-container' : 'bg-surface-container-high'
          } ${error ? 'border border-primary' : ''}`}
          accessibilityLabel={maleLabel}
          accessibilityState={{ selected: value === '1' }}
        >
          <Text
            variant="bodyLarge"
            className={value === '1' ? 'text-primary font-bold' : 'text-on-surface'}
          >
            {maleLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChange('2')}
          className={`flex-1 rounded-sm py-[12px] items-center ${
            value === '2' ? 'bg-primary-container' : 'bg-surface-container-high'
          } ${error ? 'border border-primary' : ''}`}
          accessibilityLabel={femaleLabel}
          accessibilityState={{ selected: value === '2' }}
        >
          <Text
            variant="bodyLarge"
            className={value === '2' ? 'text-primary font-bold' : 'text-on-surface'}
          >
            {femaleLabel}
          </Text>
        </Pressable>
      </View>
      {error && <FieldError message={error} />}
    </View>
  );
}
