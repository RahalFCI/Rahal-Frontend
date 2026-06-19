/**
 * Sign Up screen — Explorer registration.
 * Figma: node 1:157. Deviations: social buttons omitted, phone field added
 * per backend BaseRegisterDto.
 */
import { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { TextInput } from '../../src/shared/components/TextInput';
import { ErrorBanner } from '../../src/shared/components/ErrorBanner';
import { BeaconButton } from '../../src/shared/layout/BeaconButton';
import { useToast } from '../../src/shared/components/Toast';
import { useSignUp } from '../../src/features/auth/hooks/useSignUp';
import { signUpSchema, type SignUpFormData } from '../../src/features/auth/schemas/signUp.schema';
import { PhoneNumberInput } from '../../src/features/auth/components/PhoneNumberInput';
import { ApiError, ApiValidationError } from '../../src/shared/api/errors';
import { tokens } from '../../src/shared/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const toast = useToast();
  const signUp = useSignUp();
  const [screenError, setScreenError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    setScreenError(null);
    signUp.mutate(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phoneNumber: data.phoneNumber,
      },
      {
        onError: (error) => {
          if (error instanceof ApiValidationError) {
            error.fieldErrors.forEach((fe) => {
              const field = backendFieldToFormField(fe.property);
              setError(field, { message: fe.message });
            });
            return;
          }
          if (error instanceof ApiError) {
            if (error.tier === 'screen') {
              setScreenError(t(`errors.${errorCodeToKey(error.code)}`));
              return;
            }
            toast.show(t(`errors.${errorCodeToKey(error.code)}`));
            return;
          }
          toast.show(t('errors.server'));
        },
      },
    );
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="px-[24px] pt-[32px] pb-[40px]"
            keyboardShouldPersistTaps="handled"
          >
            {/* Headline — display treatment per Figma (large, asymmetric) */}
            <View className="pr-[40px] mb-[8px]">
              <Text variant="displaySmall" className="font-bold">
                {t('signUp.title')}
              </Text>
            </View>

            <View className="pr-[24px] mb-[24px]">
              <Text variant="bodyLarge" className="text-on-surface-variant">
                {t('signUp.subtitle')}
              </Text>
            </View>

            {/* Screen-level error banner */}
            {screenError && (
              <View className="mb-[16px]">
                <ErrorBanner message={screenError} onDismiss={() => setScreenError(null)} />
              </View>
            )}

            {/* Form */}
            <View className="gap-[16px]">
              {/* Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('signUp.nameLabel')}
                    placeholder={t('signUp.namePlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message ? t(errors.name.message) : undefined}
                    autoCapitalize="words"
                    autoComplete="name"
                    editable={!signUp.isPending}
                    accessibilityLabel={t('signUp.nameLabel')}
                  />
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('signUp.emailLabel')}
                    placeholder={t('signUp.emailPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message ? t(errors.email.message) : undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!signUp.isPending}
                    accessibilityLabel={t('signUp.emailLabel')}
                  />
                )}
              />

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('signUp.passwordLabel')}
                    placeholder={t('signUp.passwordPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message ? t(errors.password.message) : undefined}
                    secureTextEntry
                    autoComplete="new-password"
                    editable={!signUp.isPending}
                    accessibilityLabel={t('signUp.passwordLabel')}
                  />
                )}
              />

              {/* Confirm Password */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('signUp.confirmPasswordLabel')}
                    placeholder={t('signUp.confirmPasswordPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={
                      errors.confirmPassword?.message
                        ? t(errors.confirmPassword.message)
                        : undefined
                    }
                    secureTextEntry
                    autoComplete="new-password"
                    editable={!signUp.isPending}
                    accessibilityLabel={t('signUp.confirmPasswordLabel')}
                  />
                )}
              />

              {/* Phone Number */}
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PhoneNumberInput
                    label={t('signUp.phoneLabel')}
                    placeholder={t('signUp.phonePlaceholder')}
                    value={value}
                    onChange={(phoneNumber) => {
                      onChange(phoneNumber);
                      onBlur();
                    }}
                    error={errors.phoneNumber?.message ? t(errors.phoneNumber.message) : undefined}
                    editable={!signUp.isPending}
                  />
                )}
              />
            </View>

            {/* Submit */}
            <View className="mt-[32px]">
              <BeaconButton
                label={signUp.isPending ? '' : t('signUp.submit')}
                onPress={handleSubmit(onSubmit)}
                disabled={signUp.isPending}
                accessibilityLabel={t('signUp.submit')}
              />
              {signUp.isPending && (
                <ActivityIndicator
                  color={tokens.colors.onPrimary}
                  className="absolute self-center top-[14px]"
                />
              )}
            </View>

            {/* Secondary link */}
            <View className="flex-row items-center justify-center mt-[24px] gap-[4px]">
              <Text variant="bodyMedium" className="text-on-surface-variant">
                {t('signUp.hasAccount')}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-in')}>
                <Text variant="bodyMedium" className="text-primary font-bold">
                  {t('signUp.hasAccountLink')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Surface>
  );
}

/** Maps ErrorCode to translation key suffix */
function errorCodeToKey(code: string): string {
  const map: Record<string, string> = {
    INVALID_CREDENTIALS: 'invalidCredentials',
    ALREADY_EXISTS: 'alreadyExists',
    LOCKED_OUT: 'lockedOut',
    EMAIL_NOT_VERIFIED: 'emailNotVerified',
    VALIDATION_FAILED: 'validation',
    NETWORK: 'network',
    SERVER: 'server',
  };
  return map[code] ?? 'server';
}

function backendFieldToFormField(property: string): keyof SignUpFormData {
  const normalized = property.charAt(0).toLowerCase() + property.slice(1);
  const map: Record<string, keyof SignUpFormData> = {
    name: 'name',
    email: 'email',
    password: 'password',
    confirmPassword: 'confirmPassword',
    phoneNumber: 'phoneNumber',
  };
  return map[normalized] ?? 'email';
}
