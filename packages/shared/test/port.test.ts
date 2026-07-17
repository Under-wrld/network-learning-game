import { describe, expect, it } from "vitest";
import { PortSchema, classifyPort } from "../src/network/port.js";

describe("classifyPort", () => {
  it("clasifica el rango bien conocido (0-1023)", () => {
    expect(classifyPort(0)).toBe("WELL_KNOWN");
    expect(classifyPort(80)).toBe("WELL_KNOWN");
    expect(classifyPort(1023)).toBe("WELL_KNOWN");
  });

  it("clasifica el rango registrado (1024-49151)", () => {
    expect(classifyPort(1024)).toBe("REGISTERED");
    expect(classifyPort(49151)).toBe("REGISTERED");
  });

  it("clasifica el rango dinámico/efímero (49152-65535)", () => {
    expect(classifyPort(49152)).toBe("DYNAMIC");
    expect(classifyPort(65535)).toBe("DYNAMIC");
  });

  it("lanza fuera de rango", () => {
    expect(() => classifyPort(-1)).toThrow();
    expect(() => classifyPort(65536)).toThrow();
    expect(() => classifyPort(1.5)).toThrow();
  });
});

describe("PortSchema", () => {
  it("acepta y coacciona valores válidos", () => {
    expect(PortSchema.safeParse(80).success).toBe(true);
    expect(PortSchema.safeParse("80").success).toBe(true);
    expect(PortSchema.safeParse(65535).success).toBe(true);
    expect(PortSchema.safeParse(0).success).toBe(true);
  });

  it("rechaza valores fuera de rango o no numéricos", () => {
    expect(PortSchema.safeParse(65536).success).toBe(false);
    expect(PortSchema.safeParse(-1).success).toBe(false);
    expect(PortSchema.safeParse("puerto").success).toBe(false);
    expect(PortSchema.safeParse(80.5).success).toBe(false);
  });
});
