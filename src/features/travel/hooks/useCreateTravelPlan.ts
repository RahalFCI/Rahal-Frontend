/**
 * useCreateTravelPlan — generates a travel plan via the RAG-backed backend.
 *
 * Failure modes are all HTTP 400 distinguished by errorCode: no active subscription
 * (VALIDATION_FAILED, though the screen gates on premium first), per-period quota
 * reached (BUSINESS_RULE), or the RAG service failing (SERVER). Each maps to a
 * travel-specific toast so the explorer knows what to do next.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import i18n from '../../../shared/i18n';
import { createTravelPlan } from '../api/travelPlansApi';
import type { CreateTravelPlanInput, TravelPlan } from '../api/schemas';
import { travelKeys } from './keys';

function messageForError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'BUSINESS_RULE':
        return i18n.t('travel:error.limitReached');
      case 'VALIDATION_FAILED':
        return i18n.t('travel:error.subscriptionRequired');
      case 'SERVER':
      case 'NETWORK':
        return i18n.t('travel:error.generationFailed');
      default:
        return i18n.t('travel:error.generic');
    }
  }
  return i18n.t('travel:error.generic');
}

export function useCreateTravelPlan() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);

  return useMutation<TravelPlan, unknown, CreateTravelPlanInput>({
    mutationFn: (input) => createTravelPlan(input),
    onSuccess: () => {
      if (explorerId) {
        queryClient.invalidateQueries({ queryKey: travelKeys.mine(explorerId) });
      }
    },
    onError: (error) => {
      toast.show(messageForError(error));
    },
  });
}
