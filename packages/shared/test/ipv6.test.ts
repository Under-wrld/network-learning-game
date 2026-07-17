import { describe, expect, it } from "vitest";
import { expandIpv6, isValidIpv6 } from "../src/network/ipv6.js";

describe("isValidIpv6", () => {
  it.each([
    "2001:0db8:0000:0000:0000:ff00:0042:8329", // forma completa
    "2001:db8::ff00:42:8329", // forma comprimida (ejemplo canónico RFC 5952)
    "::1", // loopback
    "::", // dirección no especificada
    "fe80::1", // link-local
    "::ffff:192.168.1.1", // IPv4-mapeada
    "2001:db8::", // compresión al final
  ])("acepta %s", (value) => {
    expect(isValidIpv6(value)).toBe(true);
  });

  it.each([
    "2001:db8:::1", // triple colon
    "2001:db8::1::2", // dos compresiones "::"
    "12345::", // grupo con más de 4 dígitos hex
    "2001:db8", // muy pocos grupos, sin compresión
    "1:2:3:4:5:6:7:8:9", // demasiados grupos
    "",
    "2001:db8::ffff:999.1.1.1", // IPv4 embebida inválida
    "gggg::1", // dígitos no hexadecimales
  ])("rechaza %s", (value) => {
    expect(isValidIpv6(value)).toBe(false);
  });
});

describe("expandIpv6", () => {
  it("expande el ejemplo canónico de RFC 5952", () => {
    expect(expandIpv6("2001:db8::ff00:42:8329")).toBe(
      "2001:0db8:0000:0000:0000:ff00:0042:8329",
    );
  });

  it("expande el loopback y la dirección no especificada", () => {
    expect(expandIpv6("::1")).toBe("0000:0000:0000:0000:0000:0000:0000:0001");
    expect(expandIpv6("::")).toBe("0000:0000:0000:0000:0000:0000:0000:0000");
  });

  it("expande una dirección IPv4-mapeada", () => {
    expect(expandIpv6("::ffff:192.168.1.1")).toBe(
      "0000:0000:0000:0000:0000:ffff:c0a8:0101",
    );
  });

  it("lanza al expandir una IPv6 inválida", () => {
    expect(() => expandIpv6("no-es-ipv6")).toThrow();
  });
});
