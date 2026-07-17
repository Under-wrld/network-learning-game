import { describe, expect, it } from "vitest";
import {
  isValidSubnetMask,
  maskToPrefixLength,
  maskToWildcard,
  prefixLengthToMask,
} from "../src/network/subnet-mask.js";

describe("isValidSubnetMask", () => {
  it.each(["255.255.255.0", "255.255.255.255", "0.0.0.0", "255.255.254.0", "255.0.0.0"])(
    "acepta %s",
    (value) => {
      expect(isValidSubnetMask(value)).toBe(true);
    },
  );

  it.each(["255.255.0.255", "255.255.255.1", "192.168.1.1", "255.254.255.0"])(
    "rechaza %s (no es un prefijo contiguo de 1s)",
    (value) => {
      expect(isValidSubnetMask(value)).toBe(false);
    },
  );
});

describe("maskToPrefixLength / prefixLengthToMask", () => {
  it("convierte máscaras comunes a longitud de prefijo", () => {
    expect(maskToPrefixLength("255.255.255.0")).toBe(24);
    expect(maskToPrefixLength("255.255.255.255")).toBe(32);
    expect(maskToPrefixLength("0.0.0.0")).toBe(0);
    expect(maskToPrefixLength("255.255.255.252")).toBe(30);
  });

  it("construye la máscara a partir de la longitud de prefijo", () => {
    expect(prefixLengthToMask(24)).toBe("255.255.255.0");
    expect(prefixLengthToMask(0)).toBe("0.0.0.0");
    expect(prefixLengthToMask(32)).toBe("255.255.255.255");
    expect(prefixLengthToMask(30)).toBe("255.255.255.252");
    expect(prefixLengthToMask(26)).toBe("255.255.255.192");
  });

  it("hace round-trip prefijo → máscara → prefijo para 0..32", () => {
    for (let prefix = 0; prefix <= 32; prefix++) {
      expect(maskToPrefixLength(prefixLengthToMask(prefix))).toBe(prefix);
    }
  });
});

describe("maskToWildcard", () => {
  it("invierte la máscara para obtener la wildcard de Cisco ACLs", () => {
    expect(maskToWildcard("255.255.255.0")).toBe("0.0.0.255");
    expect(maskToWildcard("255.255.255.252")).toBe("0.0.0.3");
    expect(maskToWildcard("255.255.0.0")).toBe("0.0.255.255");
  });
});
