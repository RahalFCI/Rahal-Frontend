/**
 * SecondaryButton — primary-container background button (design.md §5 Buttons: Secondary).
 *
 * "primary-container background. Provides a 'soft amber' look for secondary actions."
 * Uses xl radius to match BeaconButton proportions.
 */
import { Pressable, type PressableProps } from 'react-native';
import { Text } from './Text';

interface SecondaryButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
}

export function SecondaryButton({ label, className, ...props }: SecondaryButtonProps) {
  return (
    <Pressable
      className={`bg-primary-container rounded-xl px-[24px] py-[12px] items-center ${className ?? ''}`}
      {...props}
    >
      <Text variant="bodyLarge" className="text-primary font-bold">
        {label}
      </Text>
    </Pressable>
  );
}
