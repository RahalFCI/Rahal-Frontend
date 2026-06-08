import { Image, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { env } from '../../../config/env';
import type { ExplorerProfileDto } from '../../auth/api/authApi';

interface DiscoverHeaderProps {
  title: string;
  profile?: ExplorerProfileDto;
  fallbackName?: string;
  levelLabel: string;
}

function resolveProfilePicture(url: string | undefined) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function DiscoverHeader({
  title,
  profile,
  fallbackName,
  levelLabel,
}: DiscoverHeaderProps) {
  const imageUrl = resolveProfilePicture(profile?.profilePictureUrl);
  const displayName = profile?.displayName || fallbackName || title;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <BlurView
      intensity={28}
      tint="light"
      className="mx-[16px] rounded-xl overflow-hidden bg-surface-container-lowest/80"
    >
      <View className="min-h-[64px] flex-row items-center px-[14px] gap-[12px]">
        <View className="h-[42px] w-[42px] rounded-xl bg-primary-container items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text variant="bodyLarge" className="text-primary font-bold">
              {initials || 'R'}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <LabelCaps>{title}</LabelCaps>
          <Text variant="bodyLarge" className="text-on-surface font-bold" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <View className="rounded-lg bg-primary px-[10px] py-[7px]">
          <Text variant="labelMedium" className="text-on-primary font-bold">
            {levelLabel}
          </Text>
        </View>
      </View>
    </BlurView>
  );
}
