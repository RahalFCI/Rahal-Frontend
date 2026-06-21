/**
 * useCheckIn — the Phase 3 check-in flow surfaced from the Quest Card.
 *
 * Captures a fresh location fix (permission + accuracy + mock-location signal),
 * posts it to the backend, and surfaces the verdict as an editorial toast — a
 * journal entry, not a slot-machine payout (CLAUDE.md §3.2). Server-side geo
 * validation may reject with AlreadyCheckedIn / UserNotAtLocation / etc., which
 * arrive as typed ApiErrors and are translated to localized messages here.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { ApiError, errorMap } from '../../../shared/api';
import { useToast } from '../../../shared/components/Toast';
import { useAuthStore } from '../../auth/store/authStore';
import i18n from '../../../shared/i18n';
import { createCheckIn } from '../api/checkInApi';
import type { CheckIn } from '../api/schemas';

/** Raised when we can't obtain a location fix — distinct from a server rejection. */
class LocationUnavailableError extends Error {
  constructor() {
    super('Location unavailable');
    this.name = 'LocationUnavailableError';
  }
}

interface CheckInFix {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  isMockLocation: boolean;
}

/** Requests permission and resolves a fresh fix; throws LocationUnavailableError otherwise. */
async function captureFix(): Promise<CheckInFix> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new LocationUnavailableError();

  // A check-in needs a *current* fix (the server compares it to the geofence), so
  // unlike the map recenter we don't accept a stale cached position. Cap the wait
  // so the button never hangs on a cold first fix.
  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
  ]);
  if (!position) throw new LocationUnavailableError();

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy ?? 0,
    isMockLocation: position.mocked ?? false,
  };
}

/** Translates a thrown error into a localized, user-facing toast message. */
function messageForError(error: unknown): string {
  if (error instanceof LocationUnavailableError) {
    return i18n.t('places:checkIn.locationUnavailable');
  }
  if (error instanceof ApiError) {
    return i18n.t(errorMap[error.code].messageKey);
  }
  return i18n.t('common:error.unknown');
}

export function useCheckIn() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const explorerId = useAuthStore((s) => s.user?.id);

  return useMutation<CheckIn, unknown, string>({
    mutationFn: async (placeId: string) => {
      if (!explorerId) throw new ApiError('UNAUTHORIZED', 'No explorer session', 401);
      const fix = await captureFix();
      return createCheckIn(explorerId, {
        placeId,
        latitude: fix.latitude,
        longitude: fix.longitude,
        accuracyMeters: fix.accuracyMeters,
        capturedAt: new Date().toISOString(),
        isMockLocation: fix.isMockLocation,
        isJailbroken: false,
      });
    },
    onSuccess: (checkIn, placeId) => {
      const name = checkIn.placeName?.trim();
      toast.show(
        name
          ? i18n.t('places:checkIn.success', { name })
          : i18n.t('places:checkIn.successGeneric'),
      );
      // Refresh anything keyed on this place's check-in state.
      queryClient.invalidateQueries({ queryKey: ['checkin', placeId] });
    },
    onError: (error) => {
      toast.show(messageForError(error));
    },
  });
}
