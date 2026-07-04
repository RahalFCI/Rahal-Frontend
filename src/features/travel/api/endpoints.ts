/**
 * Travel-plan endpoints — `TravelPlanController` (Explorer-gated). The backend
 * validates an active premium subscription + per-period `maxTravelPlans` quota, then
 * calls the external RAG service and persists the generated plan.
 */
export const travelPlanEndpoints = {
  /** POST CreateTravelPlanDto → generates + saves a plan, returns GetTravelPlanDto. */
  create: '/TravelPlan',
  /** GET the current explorer's plans (paginated, newest first). */
  mine: '/TravelPlan/mine',
  /** GET a single plan by id (scoped to the caller). */
  byId: (id: string) => `/TravelPlan/${id}`,
} as const;
