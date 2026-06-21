/**
 * DetailInfoRow — an icon + title/subtitle metadata row (Address, Opening Hours)
 * inside the tonal info card on a detail screen (image copy*.png). Greys out when
 * the underlying field is unavailable (e.g. a Place has no opening hours).
 */
import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Icon, Text } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface DetailInfoRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string | null;
  disabled?: boolean;
  /** Optional accent color for the title (e.g. an "Open Now" status). */
  accentColor?: string;
}

export function DetailInfoRow({ icon, title, subtitle, disabled, accentColor }: DetailInfoRowProps) {
  const theme = useTheme();
  const titleColor = disabled
    ? theme.colors.onSurfaceVariant
    : (accentColor ?? theme.colors.onSurface);

  return (
    <View style={[styles.row, { opacity: disabled ? 0.6 : 1 }]}>
      <Icon icon={icon} size={20} color={theme.colors.primary} strokeWidth={1.8} />
      <View style={styles.body}>
        <Text variant="bodyLarge" style={{ color: titleColor }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyMedium" className="text-on-surface-variant mt-[2px]">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  body: {
    flex: 1,
  },
});
