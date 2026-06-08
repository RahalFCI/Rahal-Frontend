/**
 * TextInput — Design-system-compliant input field (design.md §5).
 *
 * - Filled surface-container-high background, sm radius
 * - Focus: background transitions to primary-container at 30% opacity
 * - No bottom line, no 1px borders (No-Line Rule)
 * - Error state: tints input background, shows readable bodyMedium error text
 * - Touch target >= 44pt
 */
import { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { LabelCaps } from './LabelCaps';
import { FieldError } from './FieldError';
import { tokens } from '../theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { label, error, secureTextEntry, style, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasPasswordToggle = Boolean(secureTextEntry);

  const bgClass = error
    ? 'bg-primary-container/30 border border-primary'
    : isFocused
      ? 'bg-primary-container/30'
      : 'bg-surface-container-high';

  return (
    <View className="gap-[4px]">
      {label && <LabelCaps>{label}</LabelCaps>}
      <View className="relative">
        <RNTextInput
          ref={ref}
          className={`font-space-grotesk text-[16px] leading-[24px] text-on-surface px-[16px] py-[12px] rounded-sm min-h-[48px] ${
            hasPasswordToggle ? 'pr-[52px]' : ''
          } ${bgClass}`}
          placeholderTextColor={tokens.colors.onSurfaceVariant}
          secureTextEntry={hasPasswordToggle && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          style={style}
          {...props}
        />
        {hasPasswordToggle && (
          <Pressable
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute right-[12px] top-[12px] w-[32px] h-[32px] items-center justify-center"
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.8} />
            ) : (
              <Eye size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.8} />
            )}
          </Pressable>
        )}
      </View>
      {error && <FieldError message={error} />}
    </View>
  );
});
