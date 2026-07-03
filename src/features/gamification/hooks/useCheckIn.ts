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
import { getExplorerProfile, type ExplorerProfileDto } from '../../auth/api/authApi';
import i18n from '../../../shared/i18n';
import { didLevelUp, levelFromXp } from '../../../shared/gamification/leveling';
import { createCheckIn } from '../api/checkInApi';
import { useRewardOverlay } from '../components/RewardOverlay';
import { gamificationKeys } from './keys';

/** Raised when we can't obtain a location fix — distinct from a server rejection. */
class LocationUnavailableError extends Error {
  constructor() {
    super('Location unavailable');
    this.name = 'LocationUnavailableError';
  }
}

/** What the check-in entry points pass in. The place name powers the success toast
 *  (the backend success response no longer carries it). */
interface CheckInVars {
  placeId: string;
  placeName?: string;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface CheckInFix {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  isMockLocation: boolean;
}

/**
 * DEV ONLY — pin the check-in location to a single place for testing.
 * When non-null, captureFix returns these coordinates instead of the device GPS,
 * so a check-in only succeeds at the place whose geofence contains this point
 * (Cairo Tower, 30.0459/31.2243) and is rejected everywhere else. Set to `null`
 * to restore the real device-location flow.
 */
const DEV_PINNED_LOCATION: { latitude: number; longitude: number } | null = {
  latitude: 30.0459,
  longitude: 31.2243,
};

/** Requests permission and resolves a fresh fix; throws LocationUnavailableError otherwise. */
async function captureFix(): Promise<CheckInFix> {
  if (DEV_PINNED_LOCATION) {
    return {
      latitude: DEV_PINNED_LOCATION.latitude,
      longitude: DEV_PINNED_LOCATION.longitude,
      accuracyMeters: 5,
      isMockLocation: false,
    };
  }

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
  const showReward = useRewardOverlay();

  return useMutation<string, unknown, CheckInVars>({
    mutationFn: async ({ placeId }: CheckInVars) => {
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
    onSuccess: async (_message, { placeId, placeName }) => {
      const name = placeName?.trim();
      toast.show(
        name
          ? i18n.t('places:checkIn.success', { name })
          : i18n.t('places:checkIn.successGeneric'),
      );
      // Refresh anything keyed on this place's check-in state.
      queryClient.invalidateQueries({ queryKey: ['checkin', placeId] });
      if (!explorerId) return;

      // XP and stats are awarded ASYNCHRONOUSLY by a backend consumer (the POST
      // returns before the XP transaction is written), so an immediate refetch
      // usually reads stale XP. Poll a few times until cumulativeXp reflects the
      // award, then drive the beacon/level-up from the real, observed delta.
      const profileKey = ['profile', explorerId];
      const previous = queryClient.getQueryData<ExplorerProfileDto>(profileKey);
      const baselineXp = previous ? (previous.cumulativeXp ?? 0) : null;

      let fresh: ExplorerProfileDto | null = null;
      try {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          await delay(800);
          fresh = await getExplorerProfile(explorerId);
          queryClient.setQueryData(profileKey, fresh);
          // No baseline to compare against → a single refresh is all we can do.
          if (baselineXp == null) break;
          if ((fresh.cumulativeXp ?? 0) > baselineXp) break;
        }
      } catch {
        // A failed profile refresh shouldn't surface — the check-in itself succeeded.
      }

      // Refresh the gamification surfaces now that the award has (likely) landed.
      queryClient.invalidateQueries({ queryKey: gamificationKeys.xp(explorerId) });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.checkInHistory(explorerId) });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.explorerAchievements(explorerId) });

      // Reward feedback only on an observed XP gain (skip when there's no cached
      // baseline, or the award never landed within the polling window).
      if (fresh && baselineXp != null) {
        const nextXp = fresh.cumulativeXp ?? 0;
        if (nextXp > baselineXp) {
          showReward({
            xpGained: nextXp - baselineXp,
            leveledUp: didLevelUp(baselineXp, nextXp),
            newLevel: levelFromXp(nextXp).level,
          });
        }
      }
    },
    onError: (error) => {
      toast.show(messageForError(error));
    },
  });
}
