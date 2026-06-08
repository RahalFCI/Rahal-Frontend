/**
 * Edit Profile screen — update Explorer profile info and change password.
 * Calls PUT /api/explorer/{id} (multipart) and PUT /api/explorer/password/{id} (JSON).
 * Pre-populates from cached profile data; invalidates cache on success.
 */
import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { Surface } from '../../src/shared/components/Surface';
import { Text } from '../../src/shared/components/Text';
import { LabelCaps } from '../../src/shared/components/LabelCaps';
import { TextInput } from '../../src/shared/components/TextInput';
import { ErrorBanner } from '../../src/shared/components/ErrorBanner';
import { BeaconButton } from '../../src/shared/layout/BeaconButton';
import { SecondaryButton } from '../../src/shared/components/SecondaryButton';
import { useToast } from '../../src/shared/components/Toast';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProfile } from '../../src/features/auth/hooks/useProfile';
import { useCreateProfile } from '../../src/features/auth/hooks/useCreateProfile';
import { useUpdateProfile } from '../../src/features/auth/hooks/useUpdateProfile';
import { useUpdatePassword } from '../../src/features/auth/hooks/useUpdatePassword';
import { GenderSelector } from '../../src/features/auth/components/GenderSelector';
import { DatePickerField } from '../../src/features/auth/components/DatePickerField';
import { CountryPicker } from '../../src/features/auth/components/CountryPicker';
import { ProfilePicturePicker } from '../../src/features/auth/components/ProfilePicturePicker';
import { PhoneNumberInput } from '../../src/features/auth/components/PhoneNumberInput';
import {
  editProfileSchema,
  changePasswordSchema,
  type EditProfileFormData,
  type ChangePasswordFormData,
} from '../../src/features/auth/schemas/editProfile.schema';
import { ApiError, ApiValidationError } from '../../src/shared/api/errors';
import { resolveMediaUrl } from '../../src/shared/utils/mediaUrl';
import { tokens } from '../../src/shared/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorKey(code: string): string {
  const map: Record<string, string> = {
    NETWORK: 'network',
    SERVER: 'server',
    INVALID_CREDENTIALS: 'wrongPassword',
    ALREADY_EXISTS: 'emailTaken',
  };
  return map[code] ?? 'server';
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: profile, error: profileQueryError } = useProfile(user?.id);
  const isProfileSetupRequired =
    profileQueryError instanceof ApiError && profileQueryError.code === 'PROFILE_SETUP_REQUIRED';

  const createProfile = useCreateProfile(user?.id ?? '');
  const updateProfile = useUpdateProfile(user?.id ?? '');
  const updatePassword = useUpdatePassword(user?.id ?? '');

  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loadedProfileUserId, setLoadedProfileUserId] = useState<string | null>(null);

  // Birth date string → Date for the form
  const initialBirthDate = profile?.birthDate ? new Date(profile.birthDate) : undefined;

  const profileForm = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      bio: profile?.bio ?? '',
      countryCode: profile?.countryCode ?? '',
      gender: profile?.gender != null ? (String(profile.gender) as '1' | '2') : undefined,
      isPublic: profile?.isPublic ?? true,
      birthDate: initialBirthDate,
      profilePicture: undefined,
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (profile) {
      if (loadedProfileUserId === profile.userId) return;

      profileForm.reset({
        name: profile.name ?? '',
        email: profile.email ?? user?.email ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        bio: profile.bio ?? '',
        countryCode: profile.countryCode ?? '',
        gender: profile.gender != null ? (String(profile.gender) as '1' | '2') : undefined,
        isPublic: profile.isPublic ?? true,
        birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
        profilePicture: undefined,
      });
      setLoadedProfileUserId(profile.userId);
      return;
    }

    if (!isProfileSetupRequired || !user || loadedProfileUserId === user.id) return;

    profileForm.reset({
      name: '',
      email: user.email ?? '',
      phoneNumber: '',
      bio: '',
      countryCode: '',
      gender: undefined,
      isPublic: true,
      birthDate: undefined,
      profilePicture: undefined,
    });
    setLoadedProfileUserId(user.id);
  }, [isProfileSetupRequired, loadedProfileUserId, profile, profileForm, user]);

  const onSaveProfile = (data: EditProfileFormData) => {
    if (!user) return;
    setProfileError(null);

    if (isProfileSetupRequired || !profile) {
      createProfile.mutate(
        {
          displayName: data.name,
          userId: user.id,
          bio: data.bio ?? '',
          countryCode: data.countryCode,
          gender: Number(data.gender),
          isPublic: data.isPublic,
          birthDate: data.birthDate.toISOString().split('T')[0],
          isPremium: false,
          profilePicture: data.profilePicture,
        },
        {
          onSuccess: () => {
            toast.show(t('editProfile.createSuccessToast'));
            router.back();
          },
          onError: (error) => {
            if (error instanceof ApiValidationError) {
              error.fieldErrors.forEach((fe) => {
                const field = fe.property.toLowerCase() as keyof EditProfileFormData;
                profileForm.setError(field, { message: fe.message });
              });
              return;
            }
            if (error instanceof ApiError) {
              setProfileError(t(`editProfile.errors.${errorKey(error.code)}`));
              return;
            }
            setProfileError(t('editProfile.errors.server'));
          },
        },
      );
      return;
    }

    updateProfile.mutate(
      {
        displayName: data.name,
        profilePictureUrl: profile.profilePictureUrl,
        profilePicture: data.profilePicture,
        bio: data.bio ?? '',
        countryCode: data.countryCode,
        gender: Number(data.gender),
        isPublic: data.isPublic,
        birthDate: data.birthDate.toISOString().split('T')[0],
        availableXp: profile.availableXp,
        cumlativeXp: profile.cumlativeXp,
        level: profile.level,
        isPremium: profile.isPremium,
      },
      {
        onSuccess: () => {
          toast.show(t('editProfile.successToast'));
          router.back();
        },
        onError: (error) => {
          if (error instanceof ApiValidationError) {
            error.fieldErrors.forEach((fe) => {
              const field = fe.property.toLowerCase() as keyof EditProfileFormData;
              profileForm.setError(field, { message: fe.message });
            });
            return;
          }
          if (error instanceof ApiError) {
            setProfileError(t(`editProfile.errors.${errorKey(error.code)}`));
            return;
          }
          setProfileError(t('editProfile.errors.server'));
        },
      },
    );
  };

  const onChangePassword = (data: ChangePasswordFormData) => {
    setPasswordError(null);
    updatePassword.mutate(
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.show(t('editProfile.passwordSuccessToast'));
          passwordForm.reset();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.code === 'INVALID_CREDENTIALS') {
              passwordForm.setError('oldPassword', {
                message: t('editProfile.errors.wrongPassword'),
              });
              return;
            }
            setPasswordError(t(`editProfile.errors.${errorKey(error.code)}`));
            return;
          }
          setPasswordError(t('editProfile.errors.server'));
        },
      },
    );
  };

  return (
    <Surface tone="base" className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-[24px] py-[16px] gap-[12px]">
          <Pressable
            onPress={() => router.back()}
            className="w-[36px] h-[36px] items-center justify-center rounded-lg bg-surface-container-low"
            accessibilityLabel={t('editProfile.back')}
          >
            <ChevronLeft size={20} color={tokens.colors.onSurfaceVariant} strokeWidth={2} />
          </Pressable>
          <Text variant="headlineSmall" className="font-bold text-on-surface">
            {t('editProfile.title')}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 96,
              gap: 32,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Profile Information ── */}
            <View className="gap-[24px]">
              <Text variant="headlineSmall" className="font-bold text-on-surface">
                {isProfileSetupRequired
                  ? t('editProfile.sectionSetup')
                  : t('editProfile.sectionInfo')}
              </Text>

              {profileError && <ErrorBanner message={profileError} />}

              {/* Profile picture */}
              <Controller
                control={profileForm.control}
                name="profilePicture"
                render={({ field }) => (
                  <ProfilePicturePicker
                    label={t('editProfile.profilePictureLabel')}
                    actionLabel={t('editProfile.profilePictureAction')}
                    changeLabel={t('editProfile.profilePictureChange')}
                    helperText={t('editProfile.profilePictureHelper')}
                    permissionDeniedText={t('editProfile.profilePicturePermissionDenied')}
                    value={field.value}
                    onChange={field.onChange}
                    currentImageUrl={resolveMediaUrl(profile?.profilePictureUrl)}
                  />
                )}
              />

              {/* Name */}
              <Controller
                control={profileForm.control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t('editProfile.nameLabel')}
                    placeholder={t('editProfile.namePlaceholder')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    autoCapitalize="words"
                  />
                )}
              />

              {/* Email */}
              <Controller
                control={profileForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t('editProfile.emailLabel')}
                    placeholder={t('editProfile.emailPlaceholder')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              {/* Phone */}
              <Controller
                control={profileForm.control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <PhoneNumberInput
                    label={t('editProfile.phoneLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Bio */}
              <Controller
                control={profileForm.control}
                name="bio"
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t('editProfile.bioLabel')}
                    placeholder={t('editProfile.bioPlaceholder')}
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />

              {/* Country */}
              <Controller
                control={profileForm.control}
                name="countryCode"
                render={({ field, fieldState }) => (
                  <CountryPicker
                    label={t('editProfile.countryLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Gender */}
              <Controller
                control={profileForm.control}
                name="gender"
                render={({ field, fieldState }) => (
                  <GenderSelector
                    label={t('editProfile.genderLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    maleLabel={t('auth:signUp.genderMale')}
                    femaleLabel={t('auth:signUp.genderFemale')}
                  />
                )}
              />

              {/* Birth date */}
              <Controller
                control={profileForm.control}
                name="birthDate"
                render={({ field, fieldState }) => (
                  <DatePickerField
                    label={t('editProfile.birthDateLabel')}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    maximumDate={new Date()}
                    placeholder={t('auth:signUp.birthDatePlaceholder')}
                  />
                )}
              />

              {/* Is Public toggle */}
              <View className="flex-row items-center justify-between bg-surface-container-high rounded-sm px-[16px] py-[14px]">
                <View className="flex-1 pr-[16px]">
                  <LabelCaps>{t('editProfile.isPublicLabel')}</LabelCaps>
                  <Text variant="bodyMedium" className="text-on-surface-variant mt-[2px]">
                    {t('editProfile.isPublicDescription')}
                  </Text>
                </View>
                <Controller
                  control={profileForm.control}
                  name="isPublic"
                  render={({ field }) => (
                    <Switch
                      value={field.value}
                      onValueChange={field.onChange}
                      trackColor={{
                        false: tokens.colors.surfaceContainerHigh,
                        true: tokens.colors.primary,
                      }}
                      thumbColor={tokens.colors.onPrimary}
                    />
                  )}
                />
              </View>

              <View>
                <BeaconButton
                  label={
                    createProfile.isPending || updateProfile.isPending
                      ? ''
                      : isProfileSetupRequired
                        ? t('editProfile.completeProfile')
                        : t('editProfile.saveChanges')
                  }
                  onPress={profileForm.handleSubmit(onSaveProfile)}
                  disabled={createProfile.isPending || updateProfile.isPending}
                  accessibilityLabel={
                    isProfileSetupRequired
                      ? t('editProfile.completeProfile')
                      : t('editProfile.saveChanges')
                  }
                />
                {(createProfile.isPending || updateProfile.isPending) && (
                  <ActivityIndicator
                    color={tokens.colors.onPrimary}
                    className="absolute self-center top-[14px]"
                  />
                )}
              </View>
            </View>

            {/* ── Change Password ── */}
            {!isProfileSetupRequired && (
            <View className="gap-[24px]">
              <Text variant="headlineSmall" className="font-bold text-on-surface">
                {t('editProfile.sectionPassword')}
              </Text>

              {passwordError && <ErrorBanner message={passwordError} />}

              <Controller
                control={passwordForm.control}
                name="oldPassword"
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t('editProfile.oldPasswordLabel')}
                    placeholder={t('editProfile.oldPasswordPlaceholder')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    secureTextEntry
                  />
                )}
              />

              <Controller
                control={passwordForm.control}
                name="newPassword"
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t('editProfile.newPasswordLabel')}
                    placeholder={t('editProfile.newPasswordPlaceholder')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    secureTextEntry
                  />
                )}
              />

              <Controller
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <TextInput
                    label={t('editProfile.confirmPasswordLabel')}
                    placeholder={t('editProfile.confirmPasswordPlaceholder')}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    secureTextEntry
                  />
                )}
              />

              <View>
                <SecondaryButton
                  label={updatePassword.isPending ? '' : t('editProfile.changePassword')}
                  onPress={passwordForm.handleSubmit(onChangePassword)}
                  disabled={updatePassword.isPending}
                />
                {updatePassword.isPending && (
                  <ActivityIndicator
                    color={tokens.colors.primary}
                    className="absolute self-center top-[14px]"
                  />
                )}
              </View>
            </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Surface>
  );
}
