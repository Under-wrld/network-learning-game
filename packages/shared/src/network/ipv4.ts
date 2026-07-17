import { z } from "zod";

const OCTET = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

/** Valida una dirección IPv4 en notación decimal punteada (4 octetos 0–255, sin ceros a la izquierda salvo "0"). */
export function isValidIpv4(value: string): boolean {
  if (typeof value !== "string") return false;
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => OCTET.test(part) && !(part.length > 1 && part.startsWith("0")));
}

export const Ipv4AddressSchema = z
  .string()
  .refine(isValidIpv4, { message: "Dirección IPv4 inválida (esperado a.b.c.d, octetos 0-255)" })
  .brand<"Ipv4Address">();

export type Ipv4Address = z.infer<typeof Ipv4AddressSchema>;

/** Convierte una IPv4 válida a su representación entera de 32 bits sin signo. */
export function ipv4ToInt(ip: string): number {
  if (!isValidIpv4(ip)) {
    throw new Error(`No se puede convertir una IPv4 inválida: "${ip}"`);
  }
  return (
    ip
      .split(".")
      .map(Number)
      .reduce((acc, octet) => (acc << 8) + octet, 0) >>> 0
  );
}

/** Convierte un entero de 32 bits sin signo a notación decimal punteada. */
export function intToIpv4(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error(`Entero fuera de rango para IPv4 de 32 bits: ${value}`);
  }
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 0xff).join(".");
}

/** RFC 1918 — rangos de direccionamiento privado. */
export function isPrivateIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return (
    (n & 0xff000000) >>> 0 === (10 << 24) >>> 0 || // 10.0.0.0/8
    (n & 0xfff00000) >>> 0 === ((172 << 24) | (16 << 16)) >>> 0 || // 172.16.0.0/12
    (n & 0xffff0000) >>> 0 === ((192 << 24) | (168 << 16)) >>> 0 // 192.168.0.0/16
  );
}

/** RFC 1122 — bloque de loopback 127.0.0.0/8. */
export function isLoopbackIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return (n & 0xff000000) >>> 0 === (127 << 24) >>> 0;
}

/** RFC 3927 — direccionamiento link-local 169.254.0.0/16 (APIPA). */
export function isLinkLocalIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return (n & 0xffff0000) >>> 0 === ((169 << 24) | (254 << 16)) >>> 0;
}

/** RFC 5771 — bloque multicast 224.0.0.0/4 (clase D). */
export function isMulticastIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return (n & 0xf0000000) >>> 0 === (224 << 24) >>> 0;
}
