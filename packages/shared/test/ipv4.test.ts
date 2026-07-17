import { describe, expect, it } from "vitest";
import {
  intToIpv4,
  ipv4ToInt,
  isLinkLocalIpv4,
  isLoopbackIpv4,
  isMulticastIpv4,
  isPrivateIpv4,
  isValidIpv4,
} from "../src/network/ipv4.js";

describe("isValidIpv4", () => {
  it.each(["192.168.1.1", "0.0.0.0", "255.255.255.255", "10.0.0.1", "1.2.3.4"])(
    "acepta %s",
    (value) => {
      expect(isValidIpv4(value)).toBe(true);
    },
  );

  it.each([
    "256.1.1.1",
    "1.1.1",
    "1.1.1.1.1",
    "01.1.1.1",
    "192.168.1.-1",
    "abc.1.1.1",
    "",
    "192.168.1.",
  ])("rechaza %s", (value) => {
    expect(isValidIpv4(value)).toBe(false);
  });
});

describe("ipv4ToInt / intToIpv4", () => {
  it("convierte 192.168.1.1 al entero correcto y de vuelta", () => {
    expect(ipv4ToInt("192.168.1.1")).toBe(3232235777);
    expect(intToIpv4(3232235777)).toBe("192.168.1.1");
  });

  it("hace round-trip con 255.255.255.255 y 0.0.0.0", () => {
    expect(intToIpv4(ipv4ToInt("255.255.255.255"))).toBe("255.255.255.255");
    expect(intToIpv4(ipv4ToInt("0.0.0.0"))).toBe("0.0.0.0");
  });

  it("lanza al convertir una IPv4 inválida", () => {
    expect(() => ipv4ToInt("999.1.1.1")).toThrow();
  });
});

describe("clasificación de rangos IPv4 (RFC 1918, 1122, 3927, 5771)", () => {
  it("detecta rangos privados RFC 1918", () => {
    expect(isPrivateIpv4("10.0.0.1")).toBe(true);
    expect(isPrivateIpv4("172.16.0.1")).toBe(true);
    expect(isPrivateIpv4("172.31.255.255")).toBe(true);
    expect(isPrivateIpv4("192.168.0.1")).toBe(true);
    expect(isPrivateIpv4("172.32.0.1")).toBe(false);
    expect(isPrivateIpv4("172.15.255.255")).toBe(false);
    expect(isPrivateIpv4("8.8.8.8")).toBe(false);
  });

  it("detecta loopback 127.0.0.0/8", () => {
    expect(isLoopbackIpv4("127.0.0.1")).toBe(true);
    expect(isLoopbackIpv4("127.255.255.255")).toBe(true);
    expect(isLoopbackIpv4("128.0.0.1")).toBe(false);
  });

  it("detecta link-local 169.254.0.0/16", () => {
    expect(isLinkLocalIpv4("169.254.1.1")).toBe(true);
    expect(isLinkLocalIpv4("169.253.1.1")).toBe(false);
  });

  it("detecta multicast 224.0.0.0/4", () => {
    expect(isMulticastIpv4("224.0.0.1")).toBe(true);
    expect(isMulticastIpv4("239.255.255.255")).toBe(true);
    expect(isMulticastIpv4("240.0.0.0")).toBe(false);
    expect(isMulticastIpv4("223.255.255.255")).toBe(false);
  });
});
