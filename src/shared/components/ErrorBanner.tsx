/**
 * ErrorBanner — Screen-level error display (claude.md §6.4 "screen" tier).
 *
 * Uses surface-container-low background with on-surface text.
 * Not a red alert — editorial restraint per design.md.
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { CircleAlert, X } from 'lucide-react-native';
import { tokens } from '../theme';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <View className="bg-primary-container/40 border border-primary rounded-lg px-[16px] py-[12px] flex-row items-start gap-[8px]">
      <CircleAlert size={18} color={tokens.colors.primary} strokeWidth={2} />
      <Text variant="bodyMedium" className="text-on-surface flex-1 leading-[20px]">
        {message}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel={t('action.dismissError')}>
          <X size={16} color={tokens.colors.onSurface} />
        </Pressable>
      )}
    </View>
  );
}
