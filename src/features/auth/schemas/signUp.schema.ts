/**
 * Sign Up form schema — mirrors backend BaseRegisterDto + FluentValidation rules.
 * See CONTRACT.md for the full validation specification.
 */
import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=\[\]{}'";:.,<>?/\\|`~]).{8,}$/;

const e164Regex = /^\+?[1-9]\d{1,14}$/;
const countryCodeRegex = /^[A-Z]{2}$/;

const oneHundredTwentyYearsAgo = new Date();
oneHundredTwentyYearsAgo.setFullYear(oneHundredTwentyYearsAgo.getFullYear() - 120);

export const signUpSchema = z
  .object({
    name: z.string().min(3, 'auth:errors.nameLength').max(100, 'auth:errors.nameLength'),
    email: z.string().min(1, 'auth:errors.emailRequired').email('auth:errors.emailInvalid'),
    password: z
      .string()
      .min(8, 'auth:errors.passwordWeak')
      .regex(passwordRegex, 'auth:errors.passwordWeak'),
    confirmPassword: z.string().min(1, 'auth:errors.confirmPasswordRequired'),
    phoneNumber: z
      .string()
      .min(1, 'auth:errors.phoneRequired')
      .regex(e164Regex, 'auth:errors.phoneFormat'),
    birthDate: z
      .date({ message: 'auth:errors.birthDateRequired' })
      .max(new Date(), 'auth:errors.birthDateFuture')
      .min(oneHundredTwentyYearsAgo, 'auth:errors.birthDateTooOld'),
    gender: z.enum(['1', '2'], { message: 'auth:errors.genderRequired' }),
    bio: z.string().max(500, 'auth:errors.bioTooLong').optional().or(z.literal('')),
    countryCode: z
      .string()
      .min(1, 'auth:errors.countryRequired')
      .regex(countryCodeRegex, 'auth:errors.countryInvalid'),
    isPublic: z.boolean(),
    profilePicture: z
      .object({ uri: z.string(), name: z.string(), type: z.string() })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth:errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
