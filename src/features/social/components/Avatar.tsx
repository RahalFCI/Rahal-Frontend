/**
 * Avatar — an initials chip. The backend exposes no avatar image cross-context
 * (review #8), so social uses a tonal initials placeholder everywhere a face would go.
 */
import { View } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { initials } from '../utils/format';

export interface AvatarProps {
  name?: string | null;
  size?: number;
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <View
      className="rounded-full items-center justify-center bg-primary-container/30"
      style={{ width: size, height: size }}
    >
      <Text variant="labelMedium" className="text-primary font-bold">
        {initials(name)}
      </Text>
    </View>
  );
}
