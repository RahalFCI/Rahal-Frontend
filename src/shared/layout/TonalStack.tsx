
import { View, type ViewProps } from 'react-native';

interface TonalStackProps extends ViewProps {
  /** Gap between children in the stack (Tailwind spacing class) */
  gap?: string;
}

export function TonalStack({ gap = 'gap-[16px]', className, children, ...props }: TonalStackProps) {
  return (
    <View className={`flex-col ${gap} ${className ?? ''}`} {...props}>
      {children}
    </View>
  );
}
