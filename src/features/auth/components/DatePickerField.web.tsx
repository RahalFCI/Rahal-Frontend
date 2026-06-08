/**
 * DatePickerField — Web fallback using a native HTML <input type="date">.
 * @react-native-community/datetimepicker does not support web.
 * Metro automatically prefers this file over DatePickerField.tsx on web.
 *
 * The input is triggered via ref because RN's gesture system can swallow clicks.
 */
import { useRef } from 'react';
import { View, Pressable } from 'react-native';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { Text } from '../../../shared/components/Text';
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

function toInputValue(date: Date | undefined): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

function fromInputValue(raw: string): Date | undefined {
  if (!raw) return undefined;
  const d = new Date(raw + 'T00:00:00');
  return isNaN(d.getTime()) ? undefined : d;
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <View style={{ gap: 4 }}>
      {label && <LabelCaps>{label}</LabelCaps>}

      {/* Visible press target */}
      <Pressable
        onPress={() => inputRef.current?.showPicker?.()}
        style={{
          backgroundColor: error
            ? tokens.colors.primaryContainer
            : tokens.colors.surfaceContainerHigh,
          borderRadius: 4,
          borderColor: error ? tokens.colors.primary : 'transparent',
          borderWidth: error ? 1 : 0,
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 48,
          justifyContent: 'center',
        }}
        accessibilityLabel={label}
      >
        <Text variant="bodyLarge" style={{ color: value ? tokens.colors.onSurface : tokens.colors.onSurfaceVariant }}>
          {value ? formatDisplay(value) : (placeholder ?? 'Select date')}
        </Text>
      </Pressable>

      {/* Hidden native input — provides the browser date picker */}
      <input
        ref={inputRef}
        type="date"
        value={toInputValue(value)}
        max={toInputValue(maximumDate)}
        min={toInputValue(minimumDate)}
        onChange={(e) => {
          const parsed = fromInputValue(e.target.value);
          if (parsed) onChange(parsed);
        }}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 1,
          height: 1,
        }}
      />

      {error && <FieldError message={error} />}
    </View>
  );
}
