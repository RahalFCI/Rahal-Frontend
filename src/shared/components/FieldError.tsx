import { View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import { Text } from './Text';
import { tokens } from '../theme';

interface FieldErrorProps {
  message: string;
}

export function FieldError({ message }: FieldErrorProps) {
  return (
    <View className="flex-row items-start gap-[6px] pt-[2px]">
      <CircleAlert size={15} color={tokens.colors.primary} strokeWidth={2} />
      <Text variant="bodyMedium" className="text-on-surface flex-1 leading-[20px]">
        {message}
      </Text>
    </View>
  );
}
