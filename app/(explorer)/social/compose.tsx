/**
 * Compose screen — write a new post (text + up to 3 images). Pushed modally from the
 * feed FAB; navigates back on success.
 */
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { Surface } from '../../../src/shared/components/Surface';
import { Text } from '../../../src/shared/components/Text';
import { tokens } from '../../../src/shared/theme';
import { PostComposer } from '../../../src/features/social/components/PostComposer';

export default function ComposeScreen() {
  const router = useRouter();
  const { t } = useTranslation('social');

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-[24px] pt-[8px] pb-[8px]">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('comment.cancel')}>
            <X size={24} color={tokens.colors.onSurface} strokeWidth={2} />
          </Pressable>
          <Text variant="labelMedium" className="text-on-surface-variant uppercase">
            {t('feed.title')}
          </Text>
          <View className="w-[24px]" />
        </View>
        <PostComposer onPosted={() => router.back()} />
      </SafeAreaView>
    </Surface>
  );
}
