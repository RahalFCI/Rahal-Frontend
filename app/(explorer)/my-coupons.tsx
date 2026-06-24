/**
 * My Coupons route — the explorer's wallet of claimed coupons with their redeemable
 * codes. Reached from the rewards header. Hidden from the tab bar via `href: null`.
 */
import { ActivityIndicator, ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { tokens } from '../../src/shared/theme';
import { useMyCoupons } from '../../src/features/rewards/hooks/useMyCoupons';
import { UserCouponCard } from '../../src/features/rewards/components/UserCouponCard';

export default function MyCouponsScreen() {
  const router = useRouter();
  const { t } = useTranslation('rewards');
  const { userCoupons, isLoading } = useMyCoupons();

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-[16px] py-[12px]">
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/(explorer)/rewards')
            }
            className="p-[8px] rounded-lg bg-surface-container-low"
            accessibilityLabel={t('common.back')}
          >
            <ChevronLeft size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView contentContainerClassName="px-[24px] pb-[40px] gap-[20px]">
          <Text variant="headlineLarge" className="text-on-surface">
            {t('wallet.title')}
          </Text>

          {isLoading ? (
            <View className="items-center py-[48px]">
              <ActivityIndicator color={tokens.colors.primary} size="large" />
            </View>
          ) : userCoupons.length === 0 ? (
            <Surface tone="lowest" className="p-[24px] rounded-lg">
              <LabelCaps className="text-on-surface-variant">{t('wallet.empty')}</LabelCaps>
            </Surface>
          ) : (
            <View className="gap-[16px]">
              {userCoupons.map((userCoupon) => (
                <UserCouponCard key={userCoupon.id} userCoupon={userCoupon} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}
