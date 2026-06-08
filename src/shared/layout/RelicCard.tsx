
import { View, type ViewProps } from 'react-native';

export function RelicCard({ className, children, ...props }: ViewProps) {
  return (
    <View
      className={`bg-surface-container-lowest rounded-lg p-[16px] ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
