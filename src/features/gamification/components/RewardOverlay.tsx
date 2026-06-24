/**
 * RewardOverlay — host for post-check-in reward feedback. Sequences the XP beacon
 * and (if a level threshold was crossed) the Relic Title moment over whatever
 * screen is mounted. `useRewardOverlay()` returns a trigger; mount the provider
 * once near the explorer root so any check-in entry point can fire it.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { XpBeacon } from './XpBeacon';
import { RelicTitleMoment } from './RelicTitleMoment';

export interface Reward {
  /** XP gained on this check-in (0 = no beacon). */
  xpGained: number;
  /** Whether the derived level increased. */
  leveledUp: boolean;
  /** The new derived level (used for the Relic Title moment). */
  newLevel: number;
}

const RewardContext = createContext<(reward: Reward) => void>(() => {});

export function useRewardOverlay() {
  return useContext(RewardContext);
}

export function RewardOverlayProvider({ children }: { children: ReactNode }) {
  const [beacon, setBeacon] = useState<{ amount: number } | null>(null);
  const [levelUp, setLevelUp] = useState<{ level: number } | null>(null);
  const pendingLevelUp = useRef<number | null>(null);

  const show = useCallback((reward: Reward) => {
    pendingLevelUp.current = reward.leveledUp ? reward.newLevel : null;
    if (reward.xpGained > 0) {
      setBeacon({ amount: reward.xpGained });
    } else if (reward.leveledUp) {
      // Rare: leveled with no observable XP delta — go straight to the title.
      setLevelUp({ level: reward.newLevel });
      pendingLevelUp.current = null;
    }
  }, []);

  const onBeaconDone = useCallback(() => {
    setBeacon(null);
    if (pendingLevelUp.current != null) {
      setLevelUp({ level: pendingLevelUp.current });
      pendingLevelUp.current = null;
    }
  }, []);

  return (
    <RewardContext.Provider value={show}>
      {children}
      {beacon ? <XpBeacon amount={beacon.amount} onDone={onBeaconDone} /> : null}
      {levelUp ? (
        <RelicTitleMoment level={levelUp.level} onDismiss={() => setLevelUp(null)} />
      ) : null}
    </RewardContext.Provider>
  );
}
