import { describe, expect, it } from "vitest";
import { levelForXp, xpForLevel, xpToNextLevel } from "../../src/modules/user/domain/xp-progression.js";

describe("xpForLevel", () => {
  it("aplica la fórmula XP = 100 × nivel^1.5 (CLAUDE.md §4 módulo 9)", () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(283); // 100 * 2^1.5 ≈ 282.84
    expect(xpForLevel(10)).toBe(3162); // 100 * 10^1.5 ≈ 3162.28
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

  it("se mantiene en el nivel anterior justo antes del umbral", () => {
    expect(levelForXp(xpForLevel(2) - 1)).toBe(1);
    expect(levelForXp(xpForLevel(5) - 1)).toBe(4);
  });

  it("un usuario nuevo (0 XP) está en nivel 0", () => {
    expect(levelForXp(0)).toBe(0);
  });

  it("lanza para XP negativo", () => {
    expect(() => levelForXp(-1)).toThrow();
  });
});

describe("xpToNextLevel", () => {
  it("calcula el progreso dentro del nivel actual", () => {
    const result = xpToNextLevel(150);
    expect(result.currentLevel).toBe(1);
    expect(result.xpIntoLevel).toBe(50); // 150 - 100
    expect(result.xpForNextLevel).toBe(xpForLevel(2) - xpForLevel(1));
  });

  it("en 0 XP, el progreso es hacia el nivel 1", () => {
    const result = xpToNextLevel(0);
    expect(result.currentLevel).toBe(0);
    expect(result.xpIntoLevel).toBe(0);
    expect(result.xpForNextLevel).toBe(100);
  });
});
