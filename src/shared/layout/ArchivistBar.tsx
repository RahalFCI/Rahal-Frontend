
import { View, Platform, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ArchivistBarProps extends ViewProps {
  children: React.ReactNode;
}

export function ArchivistBar({ children, className, style, ...props }: ArchivistBarProps) {
  const insets = useSafeAreaInsets();

  const containerClass = `absolute bottom-[16px] left-[16px] right-[16px] rounded-xl overflow-hidden ${className ?? ''}`;

  // TODO: Evaluate Android blur performance on low-end devices (Phase 7).
  // Current fallback: solid surface at 92% opacity.
  if (Platform.OS === 'android') {
    return (
      <View
        className={containerClass}
        style={[
          { backgroundColor: 'rgba(245, 246, 247, 0.92)', paddingBottom: insets.bottom },
          style,
        ]}
        {...props}
      >
        <View className="flex-row items-center justify-around py-[8px]">{children}</View>
      </View>
    );
  }

  return (
    <BlurView
      intensity={80}
      tint="light"
      className={containerClass}
      style={[{ paddingBottom: insets.bottom }, style]}
      {...props}
    >
      <View className="flex-row items-center justify-around py-[8px]">{children}</View>
    </BlurView>
  );
}
