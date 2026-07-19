import { describe, expect, it } from "vitest";
import { levelTitle } from "../src/gamification/level-titles.js";

describe("levelTitle", () => {
  it("asigna Network Novice a los niveles 0 y 1", () => {
    expect(levelTitle(0)).toBe("Network Novice");
    expect(levelTitle(1)).toBe("Network Novice");
  });

  it("asigna Routing Master a partir del nivel 10", () => {
    expect(levelTitle(10)).toBe("Routing Master");
    expect(levelTitle(12)).toBe("Routing Master");
  });

  it("sube de tier exactamente en el umbral, nunca antes", () => {
    expect(levelTitle(9)).toBe("Switch Operator");
    expect(levelTitle(10)).toBe("Routing Master");
  });

  it("los niveles por encima del techo narrativo reusan el último título", () => {
    expect(levelTitle(30)).toBe("Network Grandmaster");
    expect(levelTitle(99)).toBe("Network Grandmaster");
  });

  it("lanza para niveles inválidos", () => {
    expect(() => levelTitle(-1)).toThrow();
    expect(() => levelTitle(1.5)).toThrow();
  });
});
