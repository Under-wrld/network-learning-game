import { describe, expect, it } from "vitest";
import {
  broadcastAddress,
  doCidrsOverlap,
  isIpInCidr,
  isValidCidr,
  networkAddress,
  parseCidr,
  totalAddresses,
  usableHostCount,
  usableHostRange,
} from "../src/network/cidr.js";

describe("isValidCidr / parseCidr", () => {
  it("acepta CIDR válidos", () => {
    expect(isValidCidr("192.168.1.0/24")).toBe(true);
    expect(isValidCidr("10.0.0.0/8")).toBe(true);
    expect(isValidCidr("0.0.0.0/0")).toBe(true);
    expect(isValidCidr("192.168.1.5/32")).toBe(true);
  });

  it("rechaza CIDR inválidos", () => {
    expect(isValidCidr("192.168.1.0/33")).toBe(false);
    expect(isValidCidr("192.168.1.0")).toBe(false);
    expect(isValidCidr("999.1.1.1/24")).toBe(false);
    expect(isValidCidr("192.168.1.0/-1")).toBe(false);
  });

  it("parsea dirección y longitud de prefijo", () => {
    expect(parseCidr("192.168.1.0/24")).toEqual({ address: "192.168.1.0", prefixLength: 24 });
  });
});

describe("networkAddress / broadcastAddress", () => {
  it("calcula red y broadcast para un /26 arbitrario dentro del bloque", () => {
    expect(networkAddress("192.168.1.130/26")).toBe("192.168.1.128");
    expect(broadcastAddress("192.168.1.130/26")).toBe("192.168.1.191");
  });

  it("calcula red y broadcast para un /24 estándar", () => {
    expect(networkAddress("192.168.1.77/24")).toBe("192.168.1.0");
    expect(broadcastAddress("192.168.1.77/24")).toBe("192.168.1.255");
  });
});

describe("totalAddresses / usableHostCount / usableHostRange", () => {
  it("calcula el total y los utilizables para un /24", () => {
    expect(totalAddresses(24)).toBe(256);
    expect(usableHostCount(24)).toBe(254);
    expect(usableHostRange("192.168.1.0/24")).toEqual({
      first: "192.168.1.1",
      last: "192.168.1.254",
    });
  });

  it("maneja el caso especial /31 (RFC 3021, enlaces punto a punto)", () => {
    expect(usableHostCount(31)).toBe(2);
    expect(usableHostRange("192.168.1.0/31")).toEqual({
      first: "192.168.1.0",
      last: "192.168.1.1",
    });
  });

  it("maneja el caso especial /32 (host route)", () => {
    expect(usableHostCount(32)).toBe(1);
    expect(usableHostRange("192.168.1.5/32")).toEqual({
      first: "192.168.1.5",
      last: "192.168.1.5",
    });
  });
});

describe("isIpInCidr", () => {
  it("determina pertenencia al bloque", () => {
    expect(isIpInCidr("192.168.1.130", "192.168.1.128/26")).toBe(true);
    expect(isIpInCidr("192.168.1.64", "192.168.1.128/26")).toBe(false);
    expect(isIpInCidr("192.168.1.191", "192.168.1.128/26")).toBe(true);
    expect(isIpInCidr("192.168.1.192", "192.168.1.128/26")).toBe(false);
  });
});

describe("doCidrsOverlap", () => {
  it("detecta superposición cuando un bloque es subconjunto de otro", () => {
    expect(doCidrsOverlap("192.168.1.0/24", "192.168.1.128/25")).toBe(true);
  });

  it("no detecta superposición entre bloques disjuntos", () => {
    expect(doCidrsOverlap("192.168.1.0/24", "192.168.2.0/24")).toBe(false);
  });

  it("detecta superposición parcial en los bordes", () => {
    expect(doCidrsOverlap("192.168.1.0/25", "192.168.1.127/32")).toBe(true);
    expect(doCidrsOverlap("192.168.1.0/25", "192.168.1.128/32")).toBe(false);
  });
});
