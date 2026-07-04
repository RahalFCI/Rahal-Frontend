/**
 * Travel-plan API (Explorer-gated). Create is premium-gated server-side and calls the
 * external RAG service, so it uses a generous timeout (RAG generation can take many
 * seconds — well past the apiClient 15s default).
 */
import { apiClient } from '../../../shared/api/client';
import { zodParse } from '../../../shared/api';
import { travelPlanEndpoints } from './endpoints';
import {
  travelPlanSchema,
  pagedTravelPlansSchema,
  type CreateTravelPlanInput,
  type PagedTravelPlans,
  type TravelPlan,
} from './schemas';

export async function createTravelPlan(input: CreateTravelPlanInput): Promise<TravelPlan> {
  const data = await apiClient<unknown>({
    method: 'POST',
    url: travelPlanEndpoints.create,
    data: input,
    timeout: 60000,
  });
  return zodParse(travelPlanSchema, data);
}

export async function getMyTravelPlans({
  page = 1,
  pageSize = 20,
}: { page?: number; pageSize?: number } = {}): Promise<PagedTravelPlans> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: travelPlanEndpoints.mine,
    params: { page, pageSize },
  });
  return zodParse(pagedTravelPlansSchema, data);
}

export async function getTravelPlanById(id: string): Promise<TravelPlan> {
  const data = await apiClient<unknown>({
    method: 'GET',
    url: travelPlanEndpoints.byId(id),
  });
  return zodParse(travelPlanSchema, data);
}
