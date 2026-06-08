/**
 * Reset Password form schema — mirrors backend ResetPasswordRequestValidator.
 */
import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=\[\]{}'";:.,<>?/\\|`~]).{8,}$/;

export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, 'auth:errors.emailRequired').email('auth:errors.emailInvalid'),
    otp: z
      .string()
      .min(1, 'auth:errors.otpRequired')
      .length(6, 'auth:errors.otpInvalid')
      .regex(/^\d{6}$/, 'auth:errors.otpInvalid'),
    newPassword: z
      .string()
      .min(8, 'auth:errors.passwordWeak')
      .regex(passwordRegex, 'auth:errors.passwordWeak'),
    confirmPassword: z.string().min(1, 'auth:errors.confirmPasswordRequired'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'auth:errors.passwordMismatch',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
