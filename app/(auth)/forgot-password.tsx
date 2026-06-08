/**
 * Forgot Password screen — asks backend to send a reset OTP/link.
 */
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { TextInput } from '../../src/shared/components/TextInput';
import { ErrorBanner } from '../../src/shared/components/ErrorBanner';
import { BeaconButton } from '../../src/shared/layout/BeaconButton';
import { useToast } from '../../src/shared/components/Toast';
import { tokens } from '../../src/shared/theme';
import { ApiError, ApiValidationError } from '../../src/shared/api/errors';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../../src/features/auth/schemas/forgotPassword.schema';
import { useForgotPassword } from '../../src/features/auth/hooks/useForgotPassword';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const toast = useToast();
  const forgotPassword = useForgotPassword();
  const [screenError, setScreenError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleError = (error: unknown) => {
    if (error instanceof ApiValidationError) {
      setError('email', { message: error.fieldErrors[0]?.message ?? t('errors.validation') });
      return;
    }
    if (error instanceof ApiError && error.tier === 'screen') {
      setScreenError(t('errors.server'));
      return;
    }
    toast.show(
      t(error instanceof ApiError ? `errors.${errorCodeToKey(error.code)}` : 'errors.server'),
    );
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-[24px] pt-[40px] pb-[24px]">
          <Text variant="headlineLarge" className="font-bold mb-[8px]">
            {t('forgotPassword.title')}
          </Text>
          <Text variant="bodyLarge" className="text-on-surface-variant mb-[24px]">
            {t('forgotPassword.subtitle')}
          </Text>
          {screenError && (
            <View className="mb-[16px]">
              <ErrorBanner message={screenError} onDismiss={() => setScreenError(null)} />
            </View>
          )}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('forgotPassword.emailLabel')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message ? t(errors.email.message) : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!forgotPassword.isPending}
              />
            )}
          />
          <View className="mt-[32px]">
            <BeaconButton
              label={forgotPassword.isPending ? '' : t('forgotPassword.submit')}
              onPress={handleSubmit((data) =>
                forgotPassword.mutate(data, { onError: handleError }),
              )}
              disabled={forgotPassword.isPending}
            />
            {forgotPassword.isPending && (
              <ActivityIndicator
                color={tokens.colors.onPrimary}
                className="absolute self-center top-[14px]"
              />
            )}
          </View>
          <Pressable className="items-center mt-[20px]" onPress={() => router.back()}>
            <Text variant="bodyMedium" className="text-on-surface-variant">
              {t('forgotPassword.back')}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}

function errorCodeToKey(code: string): string {
  return code === 'NETWORK' ? 'network' : 'server';
}
