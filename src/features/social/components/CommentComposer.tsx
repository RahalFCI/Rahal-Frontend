/**
 * CommentComposer — a single-line input + send affordance for writing a comment or
 * reply. Controlled internally; calls onSubmit(content) and clears on success.
 */
import { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Send, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../../shared/theme';

export interface CommentComposerProps {
  onSubmit: (content: string) => void;
  pending?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  /** Prefill (for editing). */
  initialValue?: string;
  /** When set, a cancel affordance is shown (for editing/reply contexts). */
  onCancel?: () => void;
}

export function CommentComposer({
  onSubmit,
  pending,
  placeholder,
  autoFocus,
  initialValue,
  onCancel,
}: CommentComposerProps) {
  const { t } = useTranslation('social');
  const [value, setValue] = useState(initialValue ?? '');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    onSubmit(trimmed);
    if (initialValue === undefined) setValue('');
  };

  return (
    <View className="flex-row items-center gap-[8px] bg-surface-container-low rounded-xl px-[14px] py-[8px]">
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder ?? t('comment.placeholder')}
        placeholderTextColor={tokens.colors.onSurfaceVariant}
        style={{ flex: 1, color: tokens.colors.onSurface, paddingVertical: 4 }}
        multiline
        autoFocus={autoFocus}
        onSubmitEditing={submit}
      />
      {onCancel ? (
        <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('comment.cancel')}>
          <X size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={1.5} />
        </Pressable>
      ) : null}
      <Pressable onPress={submit} disabled={pending} accessibilityRole="button" accessibilityLabel={t('comment.send')}>
        {pending ? (
          <ActivityIndicator size="small" color={tokens.colors.primary} />
        ) : (
          <Send size={20} color={tokens.colors.primary} strokeWidth={1.5} />
        )}
      </Pressable>
    </View>
  );
}
