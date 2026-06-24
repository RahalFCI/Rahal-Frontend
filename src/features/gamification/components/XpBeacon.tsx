/**
 * XpBeacon — the editorial XP-gain cue (CLAUDE.md §3.2: "a small amber beacon +
 * label-caps metadata line, never a full-screen celebration"). A transient pill
 * that rises, holds, and fades; calls onDone when finished.
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { useTheme } from '../../../shared/theme';

export function XpBeacon({ amount, onDone }: { amount: number; onDone: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('gamification');
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(anim, { toValue: 0, duration: 360, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [anim, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: insets.top + 16,
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          { backgroundColor: theme.colors.surfaceContainerLowest },
          theme.elevation.ambientShadow,
        ]}
      >
        <View style={[styles.beacon, { backgroundColor: theme.colors.primary }]} />
        <View>
          <Text variant="bodyLarge" className="font-bold" style={{ color: theme.colors.primary }}>
            +{amount.toLocaleString()} XP
          </Text>
          <LabelCaps style={{ color: theme.colors.onSurfaceVariant }}>
            {t('xp.beaconLabel')}
          </LabelCaps>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  beacon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
