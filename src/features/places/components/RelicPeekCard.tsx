import { Image, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { ArrowRight, MapPin } from 'lucide-react-native';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { Text } from '../../../shared/components/Text';
import { tokens } from '../../../shared/theme';
import type { PlaceMarker, PlacePhotoDto } from '../types';

interface RelicPeekCardProps {
  place: PlaceMarker;
  photos?: PlacePhotoDto[];
  newDiscoveryLabel: string;
  xpLabel: string;
  openLabel: string;
  onOpen?: () => void;
}

export function RelicPeekCard({
  place,
  photos,
  newDiscoveryLabel,
  xpLabel,
  openLabel,
  onOpen,
}: RelicPeekCardProps) {
  const photo = photos?.[0]?.url;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(160)}
      className="mx-[16px] rounded-xl bg-surface-container-lowest/95 p-[12px]"
      style={tokens.elevation.ambientShadow}
    >
      <View className="flex-row gap-[12px]">
        <View className="h-[72px] w-[72px] rounded-lg bg-primary-container overflow-hidden items-center justify-center">
          {photo ? (
            <Image source={{ uri: photo }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <MapPin size={24} color={tokens.colors.primary} strokeWidth={1.6} />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-[8px]">
            <LabelCaps className="text-primary">{newDiscoveryLabel}</LabelCaps>
            <LabelCaps className="text-primary">{xpLabel}</LabelCaps>
          </View>
          <Text variant="bodyLarge" className="text-on-surface font-bold mt-[3px]" numberOfLines={1}>
            {place.title}
          </Text>
          <Text
            variant="bodyMedium"
            className="text-on-surface-variant mt-[2px]"
            numberOfLines={2}
          >
            {place.addressLabel || place.description}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={openLabel}
          onPress={onOpen}
          className="h-[38px] w-[38px] rounded-lg bg-primary items-center justify-center self-center"
        >
          <ArrowRight size={18} color={tokens.colors.onPrimary} strokeWidth={2} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
