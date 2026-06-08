/**
 * Sign In screen — Email + password login.
 * Figma: node 1:83. Deviations: social buttons omitted, bottom tab bar replaced
 * with text links, labels adapted to use Rahal branding instead of "Cairo Quest".
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
import { Globe } from 'lucide-react-native';
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
import { useSignIn } from '../../src/features/auth/hooks/useSignIn';
import {
  GOOGLE_AUTH_NOT_CONFIGURED,
  useGoogleSignIn,
} from '../../src/features/auth/hooks/useGoogleSignIn';
import { signInSchema, type SignInFormData } from '../../src/features/auth/schemas/signIn.schema';
import { ApiError, ApiValidationError } from '../../src/shared/api/errors';
import { tokens } from '../../src/shared/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const toast = useToast();
  const signIn = useSignIn();
  const googleSignIn = useGoogleSignIn();
  const [screenError, setScreenError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: SignInFormData) => {
    setScreenError(null);
    signIn.mutate(data, {
      onError: (error) => {
        if (error instanceof ApiValidationError) {
          error.fieldErrors.forEach((fe) => {
            const field = fe.property.toLowerCase() as keyof SignInFormData;
            if (field in data) {
              setError(field, { message: fe.message });
            }
          });
          return;
        }
        if (error instanceof ApiError) {
          if (error.code === 'EMAIL_NOT_VERIFIED') {
            router.push({ pathname: '/(auth)/verify-email', params: { email: data.email } });
            return;
          }
          if (error.tier === 'screen') {
            setScreenError(t(`errors.${errorCodeToKey(error.code)}`));
            return;
          }
          toast.show(t(`errors.${errorCodeToKey(error.code)}`));
          return;
        }
        toast.show(t('errors.server'));
      },
    });
  };

  const onGoogleSignIn = async () => {
    setScreenError(null);

    try {
      await googleSignIn.signInWithGoogle();
    } catch (error) {
      if (error instanceof Error && error.message === GOOGLE_AUTH_NOT_CONFIGURED) {
        setScreenError(t('errors.googleNotConfigured'));
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

      toast.show(t('errors.googleUnavailable'));
    }
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow px-[24px] pt-[40px] pb-[24px]"
            keyboardShouldPersistTaps="handled"
          >
            {/* Headline — asymmetric offset */}
            <View className="pr-[40px] mb-[8px]">
              <Text variant="headlineLarge" className="font-bold">
                {t('signIn.title')}
              </Text>
            </View>

            <View className="pr-[24px] mb-[32px]">
              <Text variant="bodyLarge" className="text-on-surface-variant">
                {t('signIn.subtitle')}
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
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('signIn.emailLabel')}
                    placeholder={t('signIn.emailPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message ? t(errors.email.message) : undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!signIn.isPending}
                    accessibilityLabel={t('signIn.emailLabel')}
                  />
                )}
              />

              <View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label={t('signIn.passwordLabel')}
                      placeholder={t('signIn.passwordPlaceholder')}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message ? t(errors.password.message) : undefined}
                      secureTextEntry
                      autoComplete="password"
                      editable={!signIn.isPending}
                      accessibilityLabel={t('signIn.passwordLabel')}
                    />
                  )}
                />
                {/* Forgot password link — inline with password field */}
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                  className="self-end mt-[4px]"
                >
                  <Text variant="bodyMedium" className="text-primary font-bold">
                    {t('signIn.forgotPassword')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Submit */}
            <View className="mt-[32px]">
              <BeaconButton
                label={signIn.isPending ? '' : t('signIn.submit')}
                onPress={handleSubmit(onSubmit)}
                disabled={signIn.isPending || googleSignIn.isPending}
                accessibilityLabel={t('signIn.submit')}
              />
              {signIn.isPending && (
                <ActivityIndicator
                  color={tokens.colors.onPrimary}
                  className="absolute self-center top-[14px]"
                />
              )}
            </View>

            <View className="flex-row items-center mt-[24px] mb-[16px] gap-[12px]">
              <View className="h-px flex-1 bg-outline-variant" />
              <Text variant="labelMedium" className="text-on-surface-variant uppercase">
                {t('signIn.or')}
              </Text>
              <View className="h-px flex-1 bg-outline-variant" />
            </View>

            <Pressable
              onPress={onGoogleSignIn}
              disabled={
                signIn.isPending ||
                googleSignIn.isPending ||
                (googleSignIn.isConfigured && !googleSignIn.isReady)
              }
              accessibilityLabel={t('signIn.googleSubmit')}
              className={`min-h-[48px] flex-row items-center justify-center gap-[10px] rounded-xl border border-outline-variant bg-surface-container-lowest px-[24px] py-[12px] ${
                (googleSignIn.isConfigured && !googleSignIn.isReady) ||
                signIn.isPending ||
                googleSignIn.isPending
                  ? 'opacity-60'
                  : ''
              }`}
            >
              {googleSignIn.isPending ? (
                <ActivityIndicator color={tokens.colors.primary} />
              ) : (
                <Globe size={20} color={tokens.colors.primary} strokeWidth={1.8} />
              )}
              <Text variant="bodyLarge" className="text-on-surface font-bold">
                {t('signIn.googleSubmit')}
              </Text>
            </Pressable>

            {/* Secondary link */}
            <View className="flex-row items-center justify-center mt-[24px] gap-[4px]">
              <Text variant="bodyMedium" className="text-on-surface-variant">
                {t('signIn.noAccount')}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-up')}>
                <Text variant="bodyMedium" className="text-primary font-bold">
                  {t('signIn.noAccountLink')}
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
    UNAUTHORIZED: 'invalidCredentials',
  };
  return map[code] ?? 'server';
}
