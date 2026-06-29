/**
 * PostMedia — renders a post's media. Cloudinary serves transcoded delivery URLs
 * directly (verified in A3), so we just render the images. One image fills width;
 * multiple tile in a simple row of squares. Videos show a poster frame (Cloudinary
 * can deliver a .jpg of a video, but the backend stores .mp4 URLs — we render those
 * as a labeled placeholder rather than pulling in a video player for the MVP).
 */
import { View, Image } from 'react-native';
import { LabelCaps } from '../../../shared/components/LabelCaps';

export interface PostMediaProps {
  urls?: string[] | null;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm)(\?|$)/i.test(url);
}

export function PostMedia({ urls }: PostMediaProps) {
  const media = (urls ?? []).filter(Boolean);
  if (media.length === 0) return null;

  if (media.length === 1) {
    const url = media[0];
    if (isVideo(url)) {
      return (
        <View className="w-full h-[200px] rounded-lg bg-surface-container items-center justify-center">
          <LabelCaps className="text-on-surface-variant">Video</LabelCaps>
        </View>
      );
    }
    return (
      <Image
        source={{ uri: url }}
        className="w-full h-[240px] rounded-lg bg-surface-container"
        resizeMode="cover"
      />
    );
  }

  return (
    <View className="flex-row gap-[8px]">
      {media.slice(0, 3).map((url) => (
        <View key={url} className="flex-1">
          {isVideo(url) ? (
            <View className="w-full h-[110px] rounded-lg bg-surface-container items-center justify-center">
              <LabelCaps className="text-on-surface-variant">Video</LabelCaps>
            </View>
          ) : (
            <Image
              source={{ uri: url }}
              className="w-full h-[110px] rounded-lg bg-surface-container"
              resizeMode="cover"
            />
          )}
        </View>
      ))}
    </View>
  );
}
