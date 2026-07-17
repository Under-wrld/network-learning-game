import { z } from "zod";
import { intToIpv4, ipv4ToInt, isValidIpv4 } from "./ipv4.js";
import { prefixLengthToMask } from "./subnet-mask.js";

const CIDR_PATTERN = /^(.+)\/(\d{1,2})$/;

export interface ParsedCidr {
  address: string;
  prefixLength: number;
}

/** Valida notación CIDR IPv4, p. ej. "192.168.1.0/24". */
export function isValidCidr(value: string): boolean {
  const match = CIDR_PATTERN.exec(value);
  if (!match) return false;
  const address = match[1]!;
  const prefixLength = Number(match[2]!);
  return isValidIpv4(address) && prefixLength >= 0 && prefixLength <= 32;
}

export const CidrSchema = z
  .string()
  .refine(isValidCidr, { message: "CIDR inválido (esperado a.b.c.d/n, con n entre 0 y 32)" })
  .brand<"Cidr">();

export type Cidr = z.infer<typeof CidrSchema>;

export function parseCidr(cidr: string): ParsedCidr {
  const match = CIDR_PATTERN.exec(cidr);
  if (!match || !isValidCidr(cidr)) {
    throw new Error(`No se puede parsear un CIDR inválido: "${cidr}"`);
  }
  return { address: match[1]!, prefixLength: Number(match[2]!) };
}

/** Dirección de red (AND bit a bit entre la IP y la máscara). */
export function networkAddress(cidr: string): string {
  const { address, prefixLength } = parseCidr(cidr);
  const maskInt = ipv4ToInt(prefixLengthToMask(prefixLength));
  return intToIpv4((ipv4ToInt(address) & maskInt) >>> 0);
}

/** Dirección de broadcast (red con todos los bits de host en 1). */
export function broadcastAddress(cidr: string): string {
  const { prefixLength } = parseCidr(cidr);
  const maskInt = ipv4ToInt(prefixLengthToMask(prefixLength));
  const netInt = ipv4ToInt(networkAddress(cidr));
  return intToIpv4((netInt | (~maskInt >>> 0)) >>> 0);
}

/** Total de direcciones en el bloque (incluye red y broadcast), 2^(32-prefijo). */
export function totalAddresses(prefixLength: number): number {
  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error(`Longitud de prefijo fuera de rango (0-32): ${prefixLength}`);
  }
  return 2 ** (32 - prefixLength);
}

/**
 * Rango de hosts utilizables. Casos especiales por RFC:
 * - /31 (RFC 3021): las 2 direcciones son utilizables (enlaces punto a punto), sin red/broadcast dedicados.
 * - /32: host route, una sola dirección utilizable (la propia dirección).
 * - resto: total - 2 (se excluyen red y broadcast); null si el bloque no tiene hosts utilizables (/0-/30 con total<=2 ya cubiertos arriba, no aplica).
 */
export function usableHostRange(cidr: string): { first: string; last: string } | null {
  const { prefixLength } = parseCidr(cidr);
  const netInt = ipv4ToInt(networkAddress(cidr));

  if (prefixLength === 32) {
    return { first: intToIpv4(netInt), last: intToIpv4(netInt) };
  }
  if (prefixLength === 31) {
    return { first: intToIpv4(netInt), last: intToIpv4((netInt + 1) >>> 0) };
  }

  const broadcastInt = ipv4ToInt(broadcastAddress(cidr));
  if (broadcastInt - netInt < 2) return null;
  return { first: intToIpv4((netInt + 1) >>> 0), last: intToIpv4((broadcastInt - 1) >>> 0) };
}

/** Cantidad de hosts utilizables (ver usableHostRange para los casos especiales /31 y /32). */
export function usableHostCount(prefixLength: number): number {
  if (prefixLength === 32) return 1;
  if (prefixLength === 31) return 2;
  return Math.max(totalAddresses(prefixLength) - 2, 0);
}

/** ¿La IP pertenece al bloque CIDR? */
export function isIpInCidr(ip: string, cidr: string): boolean {
  const { prefixLength } = parseCidr(cidr);
  const maskInt = ipv4ToInt(prefixLengthToMask(prefixLength));
  const netInt = ipv4ToInt(networkAddress(cidr));
  return ((ipv4ToInt(ip) & maskInt) >>> 0) === netInt;
}

/** ¿Dos bloques CIDR se superponen (comparten al menos una dirección)? */
export function doCidrsOverlap(a: string, b: string): boolean {
  const aNet = ipv4ToInt(networkAddress(a));
  const aBroadcast = ipv4ToInt(broadcastAddress(a));
  const bNet = ipv4ToInt(networkAddress(b));
  const bBroadcast = ipv4ToInt(broadcastAddress(b));
  return aNet <= bBroadcast && bNet <= aBroadcast;
}
