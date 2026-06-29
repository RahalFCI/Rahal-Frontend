/**
 * PostComposer — write a post with optional images (≤3). Images are picked with
 * expo-image-picker and uploaded to Cloudinary by useCreatePost before the post is
 * created. Calls onPosted() on success (the screen navigates back).
 */
import { useState } from 'react';
import { View, TextInput, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { BeaconButton } from '../../../shared/layout/BeaconButton';
import { tokens } from '../../../shared/theme';
import { useCreatePost } from '../hooks/useCreatePost';
import { MediaTypeEnum, type MediaTypeValue } from '../api/schemas';

const MAX_MEDIA = 3;

interface PickedMedia {
  uri: string;
  mimeType?: string;
  fileType: MediaTypeValue;
}

export function PostComposer({ onPosted }: { onPosted?: () => void }) {
  const { t } = useTranslation('social');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const createPost = useCreatePost();

  const pickImage = async () => {
    if (media.length >= MAX_MEDIA) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_MEDIA - media.length,
    });
    if (result.canceled) return;
    const picked: PickedMedia[] = result.assets.map((a) => ({
      uri: a.uri,
      mimeType: a.mimeType ?? 'image/jpeg',
      fileType: MediaTypeEnum.Image,
    }));
    setMedia((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));
  };

  const canPost = (content.trim().length > 0 || media.length > 0) && !createPost.isPending;

  const submit = () => {
    if (!canPost) return;
    createPost.mutate(
      { content: content.trim(), media },
      { onSuccess: () => onPosted?.() },
    );
  };

  return (
    <View className="flex-1 px-[24px] pt-[16px] gap-[16px]">
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t('post.placeholder')}
        placeholderTextColor={tokens.colors.onSurfaceVariant}
        multiline
        autoFocus
        style={{ color: tokens.colors.onSurface, minHeight: 120, fontSize: 16, textAlignVertical: 'top' }}
      />

      {media.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
          <View className="flex-row gap-[8px]">
            {media.map((m, i) => (
              <View key={m.uri} className="relative">
                <Image source={{ uri: m.uri }} className="w-[88px] h-[88px] rounded-lg" />
                <Pressable
                  onPress={() => setMedia((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-[4px] right-[4px] bg-surface rounded-full p-[2px]"
                  accessibilityLabel={t('post.removeImage')}
                >
                  <X size={14} color={tokens.colors.onSurface} strokeWidth={2} />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={pickImage}
          disabled={media.length >= MAX_MEDIA}
          accessibilityRole="button"
          className="flex-row items-center gap-[6px] p-[8px] rounded-lg bg-surface-container-low"
        >
          <ImagePlus size={18} color={tokens.colors.primary} strokeWidth={1.5} />
          <LabelCaps className="text-on-surface-variant">
            {t('post.addImage', { count: media.length, max: MAX_MEDIA })}
          </LabelCaps>
        </Pressable>

        {createPost.isPending ? (
          <View className="flex-row items-center gap-[8px]">
            <ActivityIndicator size="small" color={tokens.colors.primary} />
            <LabelCaps className="text-on-surface-variant">{t('post.posting')}</LabelCaps>
          </View>
        ) : (
          <BeaconButton
            label={t('post.submit')}
            onPress={submit}
            disabled={!canPost}
            style={{ opacity: canPost ? 1 : 0.5 }}
          />
        )}
      </View>

      {createPost.isPending ? (
        <Text variant="labelSmall" className="text-on-surface-variant text-center">
          {t('post.uploadingHint')}
        </Text>
      ) : null}
    </View>
  );
}
