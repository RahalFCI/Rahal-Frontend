/**
 * CouponRedeemedMoment — the celebration shown after an explorer claims a coupon
 * (CLAUDE.md §3.2: framed as an archival entry, not a slot-machine win). Modeled on
 * the gamification RelicTitleMoment: a calm full-bleed overlay, offset-left copy, tap
 * to dismiss — no confetti. Carries the redeemable code as a QR the vendor scans
 * (`POST /UserCoupon/redeem`), plus the code as selectable text as a fallback.
 *
 * Reused in `mode="wallet"` for the wallet's tap-to-enlarge, where the copy reframes
 * from "just claimed" to "show this at the store".
 */
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { useTheme } from '../../../shared/theme';

export interface CouponRedeemedMomentProps {
  code: string;
  vendorName?: string | null;
  onDismiss: () => void;
  /** "claimed" = post-claim celebration; "wallet" = re-open from the wallet. */
  mode?: 'claimed' | 'wallet';
}

export function CouponRedeemedMoment({
  code,
  vendorName,
  onDismiss,
  mode = 'claimed',
}: CouponRedeemedMomentProps) {
  const theme = useTheme();
  const { t } = useTranslation('rewards');
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [anim]);

  const hint = vendorName
    ? t('redeem.showAtVendor', { vendor: vendorName })
    : t('redeem.showAtStore');

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        accessibilityRole="button"
        accessibilityLabel={t('redeem.dismiss')}
        onPress={onDismiss}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          {
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
            ],
          },
        ]}
      >
        <LabelCaps style={{ color: theme.colors.primary }}>
          {mode === 'claimed' ? t('redeem.eyebrow') : t('redeem.walletEyebrow')}
        </LabelCaps>
        <Text
          variant="displaySmall"
          className="font-bold mt-[8px]"
          style={{ color: theme.colors.onSurface }}
        >
          {mode === 'claimed' ? t('redeem.title') : t('redeem.walletTitle')}
        </Text>

        {/* QR on a light card so it stays scannable against the dark backdrop */}
        <View style={[styles.qrCard, { backgroundColor: theme.colors.surfaceContainerLowest }]}>
          <QRCode
            value={code}
            size={200}
            color={theme.colors.onSurface}
            backgroundColor={theme.colors.surfaceContainerLowest}
          />
        </View>

        <LabelCaps style={{ color: theme.colors.onSurfaceVariant }}>
          {t('wallet.codeLabel')}
        </LabelCaps>
        <Text
          variant="bodyLarge"
          selectable
          className="font-bold tracking-wider mt-[2px]"
          style={{ color: theme.colors.onSurface }}
        >
          {code}
        </Text>

        <LabelCaps style={{ color: theme.colors.onSurfaceVariant, marginTop: 20 }}>
          {hint}
        </LabelCaps>
        <LabelCaps style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          {t('redeem.dismissHint')}
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
  qrCard: {
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
});
