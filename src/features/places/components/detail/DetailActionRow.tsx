/**
 * DetailActionRow — the quick-action strip on a detail screen (image copy*.png:
 * NAVIGATE / CALL / WEBSITE / SAVE etc.). Each action greys out when it has no
 * backing data, per the agreed handling of fields absent from GetPlaceDto.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Icon, Text } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

export interface DetailAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
  /** When true the action renders greyed and non-interactive. */
  disabled?: boolean;
}

interface DetailActionRowProps {
  actions: DetailAction[];
}

export function DetailActionRow({ actions }: DetailActionRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ disabled: action.disabled }}
          disabled={action.disabled}
          onPress={action.onPress}
          style={styles.item}
        >
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: theme.colors.surfaceContainerLow,
                opacity: action.disabled ? 0.4 : 1,
              },
            ]}
          >
            <Icon
              icon={action.icon}
              size={22}
              color={action.disabled ? theme.colors.onSurfaceVariant : theme.colors.primary}
              strokeWidth={1.8}
            />
          </View>
          <Text
            variant="labelSmall"
            className="uppercase mt-[6px] text-on-surface-variant"
            style={{ opacity: action.disabled ? 0.4 : 1 }}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
