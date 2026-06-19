/**
 * Sign Up form schema — mirrors backend BaseRegisterDto + FluentValidation rules.
 * See CONTRACT.md for the full validation specification.
 */
import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=\[\]{}'";:.,<>?/\\|`~]).{8,}$/;

const e164Regex = /^\+?[1-9]\d{1,14}$/;

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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth:errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
