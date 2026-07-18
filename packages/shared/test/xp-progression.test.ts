import { describe, expect, it } from "vitest";
import { levelForXp, xpForLevel, xpToNextLevel } from "../src/gamification/xp-progression.js";

describe("xpForLevel", () => {
  it("aplica la fórmula XP = 100 × nivel^1.5 (CLAUDE.md §4 módulo 9)", () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(283);
  });

  it("lanza para niveles inválidos", () => {
    expect(() => xpForLevel(-1)).toThrow();
    expect(() => xpForLevel(1.5)).toThrow();
  });
});

describe("levelForXp", () => {
  it("es la inversa exacta de xpForLevel en los umbrales", () => {
    for (let level = 0; level <= 20; level++) {
      expect(levelForXp(xpForLevel(level))).toBe(level);
    }
  });

  it("lanza para XP negativo", () => {
    expect(() => levelForXp(-1)).toThrow();
  });
});

describe("xpToNextLevel", () => {
  it("calcula el progreso dentro del nivel actual", () => {
    const result = xpToNextLevel(150);
    expect(result.currentLevel).toBe(1);
    expect(result.xpIntoLevel).toBe(50);
    expect(result.xpForNextLevel).toBe(xpForLevel(2) - xpForLevel(1));
  });
});
