import { describe, expect, it } from 'vitest';
import { XP_PER_LEVEL, didLevelUp, levelFromXp } from './leveling';

describe('levelFromXp', () => {
  it('starts every explorer at level 1 with zero progress', () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      currentLevelXp: 0,
      xpForNextLevel: XP_PER_LEVEL,
      progressPct: 0,
    });
  });

  it('reports mid-level progress within level 1', () => {
    const half = Math.floor(XP_PER_LEVEL / 2);
    const info = levelFromXp(half);
    expect(info.level).toBe(1);
    expect(info.currentLevelXp).toBe(half);
    expect(info.progressPct).toBeCloseTo(0.5);
  });

  it('advances to level 2 exactly at the first threshold', () => {
    const info = levelFromXp(XP_PER_LEVEL);
    expect(info.level).toBe(2);
    expect(info.currentLevelXp).toBe(0);
    expect(info.progressPct).toBe(0);
  });

  it('keeps the previous level just below a threshold', () => {
    const info = levelFromXp(XP_PER_LEVEL - 1);
    expect(info.level).toBe(1);
    expect(info.currentLevelXp).toBe(XP_PER_LEVEL - 1);
  });

  it('scales across multiple levels', () => {
    expect(levelFromXp(XP_PER_LEVEL * 3 + 250).level).toBe(4);
    expect(levelFromXp(XP_PER_LEVEL * 3 + 250).currentLevelXp).toBe(250);
  });

  it('treats negative or invalid XP as zero', () => {
    expect(levelFromXp(-500).level).toBe(1);
    expect(levelFromXp(Number.NaN).level).toBe(1);
  });
});

describe('didLevelUp', () => {
  it('is true when crossing a threshold', () => {
    expect(didLevelUp(XP_PER_LEVEL - 50, XP_PER_LEVEL + 10)).toBe(true);
  });

  it('is false within the same level', () => {
    expect(didLevelUp(100, 200)).toBe(false);
  });

  it('is false when XP is unchanged', () => {
    expect(didLevelUp(XP_PER_LEVEL, XP_PER_LEVEL)).toBe(false);
  });
});
