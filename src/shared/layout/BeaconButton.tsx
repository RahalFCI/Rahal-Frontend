
import { Pressable, type PressableProps } from 'react-native';
import { Text } from '../components/Text';
import { tokens } from '../theme';

interface BeaconButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
}

export function BeaconButton({ label, className, ...props }: BeaconButtonProps) {
  return (
    <Pressable
      className={`bg-primary rounded-xl px-[24px] py-[12px] items-center ${className ?? ''}`}
      {...props}
    >
      <Text variant="bodyLarge" className="font-bold" style={{ color: tokens.colors.onPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}
