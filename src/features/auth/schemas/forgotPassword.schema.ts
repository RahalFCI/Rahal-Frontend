/**
 * Forgot Password form schema — mirrors backend ForgotPasswordRequestValidator.
 */
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'auth:errors.emailRequired').email('auth:errors.emailInvalid'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
