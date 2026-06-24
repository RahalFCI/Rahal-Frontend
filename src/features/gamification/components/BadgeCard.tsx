/**
 * BadgeCard — a framed archival badge card (CLAUDE.md §3.2: badges are cataloged,
 * not celebrated). Earned badges sit on surface-container-lowest with the amber
 * accent; unearned badges desaturate to a low tonal surface. Promoted from the
 * inline card in profile.tsx so the catalog and profile share one treatment.
 */
import { View, Pressable, Image } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';

export interface BadgeCardProps {
  name: string;
  subtitle: string;
  locked: boolean;
  imageUrl?: string;
  onPress?: () => void;
}

export function BadgeCard({ name, subtitle, locked, imageUrl, onPress }: BadgeCardProps) {
  const body = (
    <View
      className={`flex-1 items-center p-[17px] rounded-lg gap-[11px] ${
        locked ? 'bg-surface-container-low opacity-60' : 'bg-surface-container-lowest'
      }`}
      style={
        !locked
          ? {
              shadowColor: tokens.colors.onSurface,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 20,
              elevation: 2,
            }
          : undefined
      }
    >
      <View
        className={`w-[64px] h-[64px] rounded-xl items-center justify-center overflow-hidden ${
          locked ? 'bg-surface-container' : 'bg-primary-container/20'
        }`}
      >
        {imageUrl && !locked ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Trophy
            size={28}
            color={locked ? tokens.colors.onSurfaceVariant : tokens.colors.primary}
            strokeWidth={1.5}
          />
        )}
      </View>
      <View className="items-center gap-[2px]">
        <Text variant="bodyMedium" className="font-bold text-on-surface text-center">
          {name}
        </Text>
        <LabelCaps className={locked ? 'text-on-surface-variant' : 'text-primary'}>
          {subtitle}
        </LabelCaps>
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} className="flex-1" accessibilityRole="button" accessibilityLabel={name}>
      {body}
    </Pressable>
  );
}
