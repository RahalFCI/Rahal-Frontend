/**
 * DetailHero — full-bleed hero image at the top of a place/vendor detail screen
 * (image copy*.png) with floating circular close + share controls.
 */
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Share2, X, ImageOff } from 'lucide-react-native';
import { Icon } from '../../../../shared/components';
import { useTheme } from '../../../../shared/theme';

interface DetailHeroProps {
  imageUrl?: string;
  onClose: () => void;
  onShare?: () => void;
}

export function DetailHero({ imageUrl, onClose, onShare }: DetailHeroProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('places');

  return (
    <View style={[styles.hero, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Icon icon={ImageOff} size={36} color={theme.colors.onSurfaceVariant} />
        </View>
      )}

      <View style={[styles.controls, { top: insets.top + 8 }]}>
        <CircleButton
          label={t('detail.close')}
          icon={X}
          onPress={onClose}
          background={theme.colors.surfaceContainerLowest}
          color={theme.colors.onSurface}
        />
        <CircleButton
          label={t('detail.share')}
          icon={Share2}
          onPress={onShare}
          background={theme.colors.surfaceContainerLowest}
          color={theme.colors.onSurface}
        />
      </View>
    </View>
  );
}

function CircleButton({
  label,
  icon,
  onPress,
  background,
  color,
}: {
  label: string;
  icon: typeof X;
  onPress?: () => void;
  background: string;
  color: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.circle, theme.elevation.ambientShadow, { backgroundColor: background }]}
    >
      <Icon icon={icon} size={20} color={color} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 260,
    width: '100%',
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
