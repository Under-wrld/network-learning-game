import { describe, expect, it } from "vitest";
import {
  isBroadcastMac,
  isLocallyAdministeredMac,
  isMulticastMac,
  isUnicastMac,
  isValidMacAddress,
  normalizeMacAddress,
} from "../src/network/mac-address.js";

describe("isValidMacAddress", () => {
  it.each(["00:1A:2B:3C:4D:5E", "00-1A-2B-3C-4D-5E", "ff:ff:ff:ff:ff:ff"])(
    "acepta %s",
    (value) => {
      expect(isValidMacAddress(value)).toBe(true);
    },
  );

  it.each(["00:1A:2B:3C:4D", "GG:1A:2B:3C:4D:5E", "001A2B3C4D5E", ""])(
    "rechaza %s",
    (value) => {
      expect(isValidMacAddress(value)).toBe(false);
    },
  );
});

describe("bit I/G — unicast vs. multicast/broadcast (IEEE 802)", () => {
  it("reconoce direcciones unicast (LSB del primer octeto en 0)", () => {
    expect(isUnicastMac("00:1A:2B:3C:4D:5E")).toBe(true);
    expect(isMulticastMac("00:1A:2B:3C:4D:5E")).toBe(false);
  });

  it("reconoce el prefijo multicast IPv4-sobre-Ethernet 01:00:5E", () => {
    expect(isUnicastMac("01:00:5E:00:00:01")).toBe(false);
    expect(isMulticastMac("01:00:5E:00:00:01")).toBe(true);
  });

  it("reconoce la dirección de broadcast FF:FF:FF:FF:FF:FF", () => {
    expect(isBroadcastMac("FF:FF:FF:FF:FF:FF")).toBe(true);
    expect(isBroadcastMac("FF:FF:FF:FF:FF:FE")).toBe(false);
  });
});

describe("bit U/L — administrada globalmente vs. localmente", () => {
  it("reconoce el prefijo clásico de administración local 02:...", () => {
    expect(isLocallyAdministeredMac("02:00:00:00:00:01")).toBe(true);
  });

  it("reconoce una OUI de fabricante como administrada globalmente", () => {
    expect(isLocallyAdministeredMac("00:1A:2B:3C:4D:5E")).toBe(false);
  });
});

describe("normalizeMacAddress", () => {
  it("normaliza separador y capitalización", () => {
    expect(normalizeMacAddress("00-1A-2B-3C-4D-5E")).toBe("00:1a:2b:3c:4d:5e");
    expect(normalizeMacAddress("00:1A:2B:3C:4D:5E")).toBe("00:1a:2b:3c:4d:5e");
  });
});
