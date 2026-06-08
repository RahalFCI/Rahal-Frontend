import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=\[\]{}'";:.,<>?/\\|`~]).{8,}$/;

const e164Regex = /^\+?[1-9]\d{1,14}$/;

const countryCodeRegex = /^[A-Z]{2}$/;

const oneHundredTwentyYearsAgo = new Date();
oneHundredTwentyYearsAgo.setFullYear(oneHundredTwentyYearsAgo.getFullYear() - 120);

export const editProfileSchema = z.object({
  name: z.string().min(3, 'common:editProfile.errors.nameLength').max(100, 'common:editProfile.errors.nameLength'),
  email: z.string().email('common:editProfile.errors.emailInvalid'),
  phoneNumber: z.string().regex(e164Regex, 'auth:errors.phoneFormat').optional().or(z.literal('')),
  bio: z.string().max(500, 'common:editProfile.errors.bioTooLong').optional().or(z.literal('')),
  countryCode: z
    .string()
    .min(1, 'common:editProfile.errors.countryRequired')
    .regex(countryCodeRegex, 'common:editProfile.errors.countryRequired'),
  gender: z.enum(['1', '2'], { message: 'common:editProfile.errors.genderRequired' }),
  isPublic: z.boolean(),
  birthDate: z
    .date({ message: 'common:editProfile.errors.birthDateRequired' })
    .max(new Date(), 'common:editProfile.errors.birthDateRequired')
    .min(oneHundredTwentyYearsAgo, 'common:editProfile.errors.birthDateRequired'),
  profilePicture: z
    .object({ uri: z.string(), name: z.string(), type: z.string() })
    .optional(),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'common:editProfile.errors.oldPasswordRequired'),
    newPassword: z
      .string()
      .min(8, 'common:editProfile.errors.newPasswordMin')
      .regex(passwordRegex, 'common:editProfile.errors.newPasswordWeak'),
    confirmPassword: z.string().min(1, 'common:editProfile.errors.confirmPasswordRequired'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'common:editProfile.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
