/**
 * zodParse — Validates a response with a Zod schema at the client boundary.
 * Throws a clear dev-mode error on contract drift (claude.md §2.3 rule 5).
 */
import type { z } from 'zod';

export function zodParse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    if (__DEV__) {
      console.error(
        '[zodParse] Response validation failed — possible backend contract drift:\n',
        JSON.stringify(result.error.issues, null, 2),
      );
    }
    throw new Error(`Response validation failed: ${result.error.message}`);
  }
  return result.data;
}
