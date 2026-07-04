/**
 * Zod schemas for the Travel-plan feature — validated at the client boundary
 * (CLAUDE.md §2.3 rule 5). Mirrors GetTravelPlanDto / CreateTravelPlanDto.
 *
 * `generatedPlanJson` is the RAG `answer` string stored verbatim by the backend —
 * despite the name it is NOT guaranteed to be structured JSON, so treat it as free text.
 */
import { z } from 'zod';
import { pagedSchema } from '../../gamification/api/schemas';

/** GetTravelPlanDto — a generated, saved travel plan. */
export const travelPlanSchema = z.object({
  id: z.string(),
  explorerId: z.string().nullish(),
  subscriptionId: z.string().nullish(),
  budgetLimit: z.number().nullish(),
  stayDurationDays: z.number().nullish(),
  prompt: z.string().nullish(),
  generatedPlanJson: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export const pagedTravelPlansSchema = pagedSchema(travelPlanSchema);

/**
 * CreateTravelPlanDto form schema (RHF). Mirrors the backend validator:
 * prompt required (≤2000), stayDurationDays > 0, budgetLimit ≥ 0. Numeric fields are
 * coerced from the text inputs.
 */
export const createTravelPlanSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  stayDurationDays: z.coerce.number().int().positive(),
  budgetLimit: z.coerce.number().min(0),
});

export type TravelPlan = z.infer<typeof travelPlanSchema>;
export type PagedTravelPlans = z.infer<typeof pagedTravelPlansSchema>;
export type CreateTravelPlanInput = z.infer<typeof createTravelPlanSchema>;
