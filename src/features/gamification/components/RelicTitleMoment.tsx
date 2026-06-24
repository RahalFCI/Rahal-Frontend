/**
 * RelicTitleMoment — the level-up "Relic Title" moment (CLAUDE.md §3.2: "Display
 * typography, offset left, no confetti"). A calm full-bleed overlay that frames
 * the new level as an archival title, not a slot-machine win. Tap to dismiss.
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { useTheme } from '../../../shared/theme';

export function RelicTitleMoment({ level, onDismiss }: { level: number; onDismiss: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation('gamification');
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        accessibilityRole="button"
        accessibilityLabel={t('levelUp.dismiss')}
        onPress={onDismiss}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.content,
          {
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
            ],
          },
        ]}
      >
        <LabelCaps style={{ color: theme.colors.primary }}>{t('levelUp.eyebrow')}</LabelCaps>
        <Text variant="displayLarge" className="font-bold mt-[8px]" style={{ color: theme.colors.onSurface }}>
          {t('levelUp.title', { level })}
        </Text>
        <Text variant="bodyLarge" className="mt-[12px]" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('levelUp.body')}
        </Text>
        <LabelCaps style={{ color: theme.colors.onSurfaceVariant, marginTop: 24 }}>
          {t('levelUp.dismissHint')}
        </LabelCaps>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(20, 18, 14, 0.82)',
    justifyContent: 'center',
    zIndex: 50,
  },
  content: {
    paddingLeft: 32,
    paddingRight: 64,
  },
});
