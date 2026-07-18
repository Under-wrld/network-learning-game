import { describe, expect, it } from "vitest";
import { computeNextStreak } from "../../src/modules/user/domain/streak.js";

const DAY = 86_400_000;

describe("computeNextStreak", () => {
  it("primera actividad de un usuario nuevo arranca la racha en 1", () => {
    const result = computeNextStreak({
      lastActivityAt: null,
      now: new Date("2026-07-17T12:00:00Z"),
      current: { currentStreak: 0, longestStreak: 0 },
    });
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  it("segunda actividad el mismo día no cambia la racha", () => {
    const result = computeNextStreak({
      lastActivityAt: new Date("2026-07-17T08:00:00Z"),
      now: new Date("2026-07-17T20:00:00Z"),
      current: { currentStreak: 3, longestStreak: 5 },
    });
    expect(result).toEqual({ currentStreak: 3, longestStreak: 5 });
  });

  it("actividad al día calendario siguiente incrementa la racha", () => {
    const result = computeNextStreak({
      lastActivityAt: new Date("2026-07-17T23:00:00Z"),
      now: new Date(new Date("2026-07-17T23:00:00Z").getTime() + DAY),
      current: { currentStreak: 3, longestStreak: 5 },
    });
    expect(result).toEqual({ currentStreak: 4, longestStreak: 5 });
  });

  it("una racha nueva que supera el récord también sube longestStreak", () => {
    const result = computeNextStreak({
      lastActivityAt: new Date("2026-07-17T10:00:00Z"),
      now: new Date(new Date("2026-07-17T10:00:00Z").getTime() + DAY),
      current: { currentStreak: 5, longestStreak: 5 },
    });
    expect(result).toEqual({ currentStreak: 6, longestStreak: 6 });
  });

  it("un hueco de más de un día resetea la racha a 1, sin bajar el récord", () => {
    const result = computeNextStreak({
      lastActivityAt: new Date("2026-07-10T10:00:00Z"),
      now: new Date("2026-07-17T10:00:00Z"),
      current: { currentStreak: 8, longestStreak: 10 },
    });
    expect(result).toEqual({ currentStreak: 1, longestStreak: 10 });
  });
});
