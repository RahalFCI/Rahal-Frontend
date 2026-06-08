/**
 * Reset Password screen — completes the OTP password reset flow.
 */
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
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
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../../src/features/auth/schemas/resetPassword.schema';
import { useResetPassword } from '../../src/features/auth/hooks/useResetPassword';

export default function ResetPasswordScreen() {
  const { t } = useTranslation('auth');
  const params = useLocalSearchParams<{ email?: string }>();
  const toast = useToast();
  const resetPassword = useResetPassword();
  const [screenError, setScreenError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: params.email ?? '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleError = (error: unknown) => {
    if (error instanceof ApiValidationError) {
      error.fieldErrors.forEach((fe) => {
        const field = fieldFromBackend(fe.property);
        setError(field, { message: fe.message });
      });
      return;
    }
    if (error instanceof ApiError && error.tier === 'screen') {
      setScreenError(t('errors.server'));
      return;
    }
    toast.show(
      t(error instanceof ApiError && error.code === 'NETWORK' ? 'errors.network' : 'errors.server'),
    );
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-[24px] pt-[40px] pb-[24px]">
          <Text variant="headlineLarge" className="font-bold mb-[8px]">
            {t('resetPassword.title')}
          </Text>
          <Text variant="bodyLarge" className="text-on-surface-variant mb-[24px]">
            {t('resetPassword.subtitle')}
          </Text>
          {screenError && (
            <View className="mb-[16px]">
              <ErrorBanner message={screenError} onDismiss={() => setScreenError(null)} />
            </View>
          )}
          <View className="gap-[16px]">
            {(['email', 'otp', 'newPassword', 'confirmPassword'] as const).map((name) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t(`resetPassword.${name}Label`)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors[name]?.message ? t(errors[name]?.message ?? '') : undefined}
                    keyboardType={
                      name === 'otp' ? 'number-pad' : name === 'email' ? 'email-address' : 'default'
                    }
                    autoCapitalize="none"
                    secureTextEntry={name === 'newPassword' || name === 'confirmPassword'}
                    maxLength={name === 'otp' ? 6 : undefined}
                    editable={!resetPassword.isPending}
                  />
                )}
              />
            ))}
          </View>
          <View className="mt-[32px]">
            <BeaconButton
              label={resetPassword.isPending ? '' : t('resetPassword.submit')}
              onPress={handleSubmit((data) => resetPassword.mutate(data, { onError: handleError }))}
              disabled={resetPassword.isPending}
            />
            {resetPassword.isPending && (
              <ActivityIndicator
                color={tokens.colors.onPrimary}
                className="absolute self-center top-[14px]"
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}

function fieldFromBackend(property: string): keyof ResetPasswordFormData {
  const normalized = property.charAt(0).toLowerCase() + property.slice(1);
  if (normalized === 'newPassword') return 'newPassword';
  if (normalized === 'confirmPassword') return 'confirmPassword';
  if (normalized === 'otp') return 'otp';
  return 'email';
}
