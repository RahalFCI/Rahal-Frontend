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
  Switch,
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
import { DatePickerField } from '../../src/features/auth/components/DatePickerField';
import { GenderSelector } from '../../src/features/auth/components/GenderSelector';
import { CountryPicker } from '../../src/features/auth/components/CountryPicker';
import { ProfilePicturePicker } from '../../src/features/auth/components/ProfilePicturePicker';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
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
      birthDate: undefined,
      gender: undefined,
      bio: '',
      countryCode: '',
      isPublic: true,
      profilePicture: undefined,
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
        birthDate: data.birthDate.toISOString().split('T')[0],
        gender: Number(data.gender),
        bio: data.bio ?? '',
        countryCode: data.countryCode,
        isPublic: data.isPublic,
        profilePicture: data.profilePicture,
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

              {/* Profile picture */}
              <Controller
                control={control}
                name="profilePicture"
                render={({ field }) => (
                  <ProfilePicturePicker
                    label={t('signUp.profilePictureLabel')}
                    actionLabel={t('signUp.profilePictureAction')}
                    changeLabel={t('signUp.profilePictureChange')}
                    helperText={t('signUp.profilePictureHelper')}
                    permissionDeniedText={t('signUp.profilePicturePermissionDenied')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {/* Country */}
              <Controller
                control={control}
                name="countryCode"
                render={({ field: { onChange, value }, fieldState }) => (
                  <CountryPicker
                    label={t('signUp.countryLabel')}
                    placeholder={t('signUp.countryPlaceholder')}
                    value={value}
                    onChange={onChange}
                    error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                  />
                )}
              />

              {/* Gender */}
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value }, fieldState }) => (
                  <GenderSelector
                    label={t('signUp.genderLabel')}
                    value={value}
                    onChange={onChange}
                    error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                    maleLabel={t('signUp.genderMale')}
                    femaleLabel={t('signUp.genderFemale')}
                  />
                )}
              />

              {/* Birth date */}
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value }, fieldState }) => (
                  <DatePickerField
                    label={t('signUp.birthDateLabel')}
                    placeholder={t('signUp.birthDatePlaceholder')}
                    value={value}
                    onChange={onChange}
                    error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                    maximumDate={new Date()}
                  />
                )}
              />

              {/* Bio */}
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <TextInput
                    label={t('signUp.bioLabel')}
                    placeholder={t('signUp.bioPlaceholder')}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                    multiline
                    numberOfLines={3}
                    editable={!signUp.isPending}
                    accessibilityLabel={t('signUp.bioLabel')}
                  />
                )}
              />

              {/* Public profile */}
              <View className="flex-row items-center justify-between bg-surface-container-high rounded-sm px-[16px] py-[14px]">
                <View className="flex-1 pr-[16px]">
                  <LabelCaps>{t('signUp.isPublicLabel')}</LabelCaps>
                  <Text variant="bodyMedium" className="text-on-surface-variant mt-[2px]">
                    {t('signUp.isPublicDescription')}
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="isPublic"
                  render={({ field }) => (
                    <Switch
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={signUp.isPending}
                      trackColor={{
                        false: tokens.colors.surfaceContainerHigh,
                        true: tokens.colors.primary,
                      }}
                      thumbColor={tokens.colors.onPrimary}
                    />
                  )}
                />
              </View>
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
    birthDate: 'birthDate',
    gender: 'gender',
    bio: 'bio',
    countryCode: 'countryCode',
    isPublic: 'isPublic',
    profilePicture: 'profilePicture',
  };
  return map[normalized] ?? 'email';
}
