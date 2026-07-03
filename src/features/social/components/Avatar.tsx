/**
 * Avatar — an initials chip. The backend exposes no avatar image cross-context
 * (review #8), so social uses a tonal initials placeholder everywhere a face would go.
 *
 * "Warm editorial magazine" treatment: an optional amber halo (`ring`) wraps the
 * chip in a soft primary-container glow so authors feel present, not clerical. The
 * ring is a tonal background shift, never a 1px border (design.md §2 no-line rule).
 */
import { View } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { initials } from '../utils/format';

export interface AvatarProps {
  name?: string | null;
  size?: number;
  /** Wrap the chip in a soft amber halo. Defaults on — the warm magazine look. */
  ring?: boolean;
}

export function Avatar({ name, size = 44, ring = true }: AvatarProps) {
  const chip = (
    <View
      className="rounded-full items-center justify-center bg-surface-container-lowest"
      style={{ width: size, height: size }}
    >
      <Text variant="labelMedium" className="text-primary font-bold">
        {initials(name)}
      </Text>
    </View>
  );

  if (!ring) {
    return (
      <View
        className="rounded-full items-center justify-center bg-primary-container/40"
        style={{ width: size, height: size }}
      >
        <Text variant="labelMedium" className="text-primary font-bold">
          {initials(name)}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-full items-center justify-center bg-primary-container/50"
      style={{ width: size + 6, height: size + 6 }}
    >
      {chip}
    </View>
  );
}
