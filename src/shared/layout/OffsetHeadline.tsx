
import { View, type ViewProps } from 'react-native';
import { Text } from '../components/Text';

interface OffsetHeadlineProps extends ViewProps {
  title: string;
}

export function OffsetHeadline({ title, className, ...props }: OffsetHeadlineProps) {
  return (
    <View className={`pl-[24px] pr-[40px] ${className ?? ''}`} {...props}>
      <Text variant="headlineLarge">{title}</Text>
    </View>
  );
}
