/**
 * Leveling — frontend-derived Explorer level from cumulative XP.
 *
 * The backend does NOT compute Level from XP: `ExplorerProfile.Level` defaults
 * to 1 and only changes via an admin endpoint (no XP→Level logic exists in
 * Gamification.*). So the app derives level itself from `cumulativeXp` using a
 * single, fixed threshold. This keeps the level display meaningful and makes the
 * level-up "Relic Title" moment (CLAUDE.md §3.2, §1.4 #3) demonstrable with no
 * backend dependency. See CLAUDE.md §9 Decision Log.
 *
 * Model: every level costs the same `XP_PER_LEVEL`. Level 1 spans [0, XP_PER_LEVEL).
 * Change the constant to retune the whole curve.
 */

/** XP required to advance one level. The single tunable knob for progression. */
export const XP_PER_LEVEL = 1000;

export interface LevelInfo {
  /** 1-based level derived from cumulative XP. */
  level: number;
  /** XP earned within the current level (0 .. XP_PER_LEVEL). */
  currentLevelXp: number;
  /** XP span of a level (constant under the fixed-threshold model). */
  xpForNextLevel: number;
  /** Fraction (0..1) of the current level completed. */
  progressPct: number;
}

/** Derives level + intra-level progress from cumulative XP. */
export function levelFromXp(cumulativeXp: number): LevelInfo {
  const xp = Number.isFinite(cumulativeXp) && cumulativeXp > 0 ? Math.floor(cumulativeXp) : 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = xp % XP_PER_LEVEL;
  return {
    level,
    currentLevelXp,
    xpForNextLevel: XP_PER_LEVEL,
    progressPct: currentLevelXp / XP_PER_LEVEL,
  };
}

/** True when crossing from `previousXp` to `nextXp` increases the derived level. */
export function didLevelUp(previousXp: number, nextXp: number): boolean {
  return levelFromXp(nextXp).level > levelFromXp(previousXp).level;
}
