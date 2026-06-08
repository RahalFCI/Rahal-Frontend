/**
 * Verify Email screen — OTP confirmation required by backend before login.
 */
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  verifyEmailSchema,
  type VerifyEmailFormData,
} from '../../src/features/auth/schemas/verifyEmail.schema';
import { useVerifyEmail } from '../../src/features/auth/hooks/useVerifyEmail';
import { useResendVerification } from '../../src/features/auth/hooks/useResendVerification';

export default function VerifyEmailScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const toast = useToast();
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [screenError, setScreenError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: params.email ?? '', otp: '' },
  });

  const handleError = (error: unknown) => {
    if (error instanceof ApiValidationError) {
      error.fieldErrors.forEach((fe) => {
        const field = fe.property === 'Otp' ? 'otp' : 'email';
        setError(field, { message: fe.message });
      });
      setScreenError(t('verifyEmail.invalidCode'));
      return;
    }
    if (error instanceof ApiError) {
      const message = t(`errors.${errorCodeToKey(error.code)}`);
      if (error.tier === 'screen' || error.code === 'VALIDATION_FAILED') {
        setScreenError(message);
      } else {
        toast.show(message);
      }
      return;
    }
    setScreenError(t('errors.server'));
  };

  const handleResendError = (error: unknown) => {
    if (error instanceof ApiValidationError) {
      setScreenError(t('verifyEmail.resendUnavailable'));
      return;
    }
    if (error instanceof ApiError) {
      if (error.code === 'RATE_LIMITED') {
        setScreenError(t('errors.rateLimited'));
        return;
      }
      if (error.code === 'NETWORK') {
        toast.show(t('errors.network'));
        return;
      }
      setScreenError(t('verifyEmail.resendUnavailable'));
      return;
    }
    setScreenError(t('errors.server'));
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="flex-grow px-[24px] pt-[40px] pb-[24px]">
          <View className="pr-[40px] mb-[8px]">
            <Text variant="headlineLarge" className="font-bold">
              {t('verifyEmail.title')}
            </Text>
          </View>
          <Text variant="bodyLarge" className="text-on-surface-variant mb-[24px]">
            {t('verifyEmail.subtitle')}
          </Text>

          {screenError && (
            <View className="mb-[16px]">
              <ErrorBanner message={screenError} onDismiss={() => setScreenError(null)} />
            </View>
          )}

          <View className="gap-[16px]">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={t('verifyEmail.emailLabel')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message ? t(errors.email.message) : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!verify.isPending}
                />
              )}
            />
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label={t('verifyEmail.otpLabel')}
                  placeholder={t('verifyEmail.otpPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.otp?.message ? t(errors.otp.message) : undefined}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!verify.isPending}
                />
              )}
            />
          </View>

          <View className="mt-[32px]">
            <BeaconButton
              label={verify.isPending ? '' : t('verifyEmail.submit')}
              onPress={handleSubmit((data) => {
                setScreenError(null);
                verify.mutate(data, { onError: handleError });
              })}
              disabled={verify.isPending}
            />
            {verify.isPending && (
              <ActivityIndicator
                color={tokens.colors.onPrimary}
                className="absolute self-center top-[14px]"
              />
            )}
          </View>

          <Pressable
            className="items-center mt-[20px]"
            disabled={resend.isPending}
            onPress={() => {
              setScreenError(null);
              resend.mutate({ email: getValues('email') }, { onError: handleResendError });
            }}
          >
            <Text variant="bodyMedium" className="text-primary font-bold">
              {resend.isPending ? t('verifyEmail.resending') : t('verifyEmail.resend')}
            </Text>
          </Pressable>

          <Pressable
            className="items-center mt-[12px]"
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text variant="bodyMedium" className="text-on-surface-variant">
              {t('verifyEmail.backToSignIn')}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}

function errorCodeToKey(code: string): string {
  const map: Record<string, string> = {
    VALIDATION_FAILED: 'invalidCode',
    RATE_LIMITED: 'rateLimited',
    NETWORK: 'network',
    SERVER: 'server',
    UNKNOWN: 'server',
  };
  return map[code] ?? 'server';
}
