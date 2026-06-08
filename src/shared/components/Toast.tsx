/**
 * Toast — Minimal toast notification system built on design primitives.
 * Uses Animated API for slide-in/out, auto-dismisses after 3 seconds.
 * No external library — composed from Surface + Text (claude.md §9: no new UI libs).
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { tokens } from '../theme';

// useNativeDriver is unsupported on web — animations run via JS there instead
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setMessage(msg);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: USE_NATIVE_DRIVER,
        tension: 80,
        friction: 12,
      }).start();

      timeoutRef.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start(() => setMessage(null));
      }, TOAST_DURATION);
    },
    [translateY],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <Animated.View
          style={[
            styles.container,
            {
              top: insets.top + 8,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text variant="bodyMedium" className="text-on-surface">
            {message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: tokens.colors.surfaceContainerLow,
    borderRadius: tokens.radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 9999,
    ...tokens.elevation.ambientShadow,
  },
});
