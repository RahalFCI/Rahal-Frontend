/**
 * Welcome screen — app's first impression.
 * Uses project-owned Rahal brand artwork while keeping the editorial layout restrained.
 */
import { Image, ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { BeaconButton } from '../../src/shared/layout/BeaconButton';
import { SecondaryButton } from '../../src/shared/components/SecondaryButton';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <ImageBackground
          source={require('../../assets/images/brand/welcome-background.png')}
          resizeMode="cover"
          className="flex-[1.18] overflow-hidden rounded-b-xl"
        >
          <View className="absolute inset-0 bg-surface/10" />
          <View className="absolute left-0 right-0 bottom-0 h-[150px] bg-surface/75" />

          <View className="flex-1 items-center justify-end pb-[24px]">
            <View className="bg-surface-container-lowest/90 rounded-xl w-[76px] h-[76px] items-center justify-center">
              <Image
                source={require('../../assets/images/brand/rahal-logo.png')}
                className="w-[60px] h-[60px]"
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
          </View>
        </ImageBackground>

        <View className="px-[24px] pt-[32px] pb-[16px]">
          <View className="pr-[40px]">
            <Text variant="displaySmall" className="font-bold">
              {t('welcome.title')}
            </Text>
          </View>

          <View className="mt-[8px] pr-[24px]">
            <Text variant="headlineSmall" className="text-on-surface">
              {t('welcome.subtitle')}
            </Text>
          </View>

          <View className="mt-[12px] pr-[16px]">
            <Text variant="bodyLarge" className="text-on-surface-variant">
              {t('welcome.description')}
            </Text>
          </View>
        </View>

        <View className="px-[24px] pb-[24px] gap-[12px]">
          <BeaconButton
            label={t('welcome.getStarted')}
            onPress={() => router.push('/(auth)/sign-up')}
            accessibilityLabel={t('welcome.getStarted')}
          />

          <SecondaryButton
            label={t('welcome.signIn')}
            onPress={() => router.push('/(auth)/sign-in')}
            accessibilityLabel={t('welcome.signIn')}
          />
        </View>

        <View className="items-center pb-[16px]">
          <LabelCaps>{t('welcome.footer')}</LabelCaps>
        </View>
      </SafeAreaView>
    </Surface>
  );
}
