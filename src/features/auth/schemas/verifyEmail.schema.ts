/**
 * Verify Email form schema — mirrors backend VerifyOtpValidator.
 */
import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().min(1, 'auth:errors.emailRequired').email('auth:errors.emailInvalid'),
  otp: z
    .string()
    .min(1, 'auth:errors.otpRequired')
    .length(6, 'auth:errors.otpInvalid')
    .regex(/^\d{6}$/, 'auth:errors.otpInvalid'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
