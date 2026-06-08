/**
 * DatePickerField — Pressable that opens a native date picker (iOS / Android).
 * Web counterpart lives in DatePickerField.web.tsx — Metro picks it automatically.
 */
import { useState } from 'react';
import { Pressable, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { FieldError } from '../../../shared/components/FieldError';
import { tokens } from '../../../shared/theme';

interface DatePickerFieldProps {
  label?: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  placeholder,
  maximumDate,
  minimumDate,
}: DatePickerFieldProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className="gap-[4px]">
      {label && <LabelCaps>{label}</LabelCaps>}
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`rounded-sm px-[16px] py-[12px] min-h-[48px] justify-center ${
          error ? 'bg-primary-container/30 border border-primary' : 'bg-surface-container-high'
        }`}
        accessibilityLabel={label}
      >
        <Text variant="bodyLarge" className={value ? 'text-on-surface' : 'text-on-surface-variant'}>
          {value ? formatDate(value) : (placeholder ?? '')}
        </Text>
      </Pressable>

      {showPicker && (
        <>
          <DateTimePicker
            value={value ?? new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            accentColor={tokens.colors.primary}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              onPress={() => setShowPicker(false)}
              className="items-end px-[16px] py-[8px]"
            >
              <Text variant="bodyLarge" className="text-primary font-bold">
                {t('action.done')}
              </Text>
            </Pressable>
          )}
        </>
      )}

      {error && <FieldError message={error} />}
    </View>
  );
}
