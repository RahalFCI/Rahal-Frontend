/**
 * Sign In form schema — mirrors backend AuthRequestDto validation.
 * Mirrors backend AuthRequestDtoValidator: email required/valid, password min 8.
 */
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'auth:errors.emailRequired').email('auth:errors.emailInvalid'),
  password: z.string().min(1, 'auth:errors.passwordRequired').min(8, 'auth:errors.passwordMin'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
