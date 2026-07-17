import { z } from "zod";
import { isValidIpv4 } from "./ipv4.js";

const HEX_GROUP = /^[0-9a-fA-F]{1,4}$/;

/**
 * Valida una dirección IPv6 (RFC 4291), incluyendo compresión "::" y el
 * sufijo IPv4-mapeado (p. ej. "::ffff:192.168.1.1"). No soporta zone IDs
 * (RFC 4007, p. ej. "fe80::1%eth0") — fuera de alcance para el MVP.
 */
export function isValidIpv6(input: string): boolean {
  if (typeof input !== "string" || input.length === 0) return false;
  if (input.includes(" ") || input.includes(":::")) return false;

  let address = input;

  const lastColonIndex = address.lastIndexOf(":");
  if (lastColonIndex === -1) return false;
  const tail = address.slice(lastColonIndex + 1);
  if (tail.includes(".")) {
    if (!isValidIpv4(tail)) return false;
    // El sufijo IPv4 ocupa 32 bits == 2 grupos hex de 16 bits; se reemplaza
    // por un placeholder neutro para reusar el conteo de grupos de abajo.
    address = `${address.slice(0, lastColonIndex + 1)}0:0`;
  }

  const parts = address.split("::");
  if (parts.length > 2) return false;

  if (parts.length === 2) {
    // parts.length === 2 garantiza que ambos índices existen.
    const left = parts[0]!;
    const right = parts[1]!;
    const leftGroups = left === "" ? [] : left.split(":");
    const rightGroups = right === "" ? [] : right.split(":");
    if (!leftGroups.every((g) => HEX_GROUP.test(g))) return false;
    if (!rightGroups.every((g) => HEX_GROUP.test(g))) return false;
    // "::" debe representar al menos un grupo de ceros comprimido.
    return leftGroups.length + rightGroups.length < 8;
  }

  const groups = address.split(":");
  if (groups.length !== 8) return false;
  return groups.every((g) => HEX_GROUP.test(g));
}

export const Ipv6AddressSchema = z
  .string()
  .refine(isValidIpv6, { message: "Dirección IPv6 inválida" })
  .brand<"Ipv6Address">();

export type Ipv6Address = z.infer<typeof Ipv6AddressSchema>;

/** Expande una IPv6 (con "::" u omisión de ceros) a su forma completa de 8 grupos de 4 dígitos hex. */
export function expandIpv6(input: string): string {
  if (!isValidIpv6(input)) {
    throw new Error(`No se puede expandir una IPv6 inválida: "${input}"`);
  }

  let address = input;
  const lastColonIndex = address.lastIndexOf(":");
  const tail = address.slice(lastColonIndex + 1);
  if (tail.includes(".")) {
    // tail ya fue validado como IPv4 por isValidIpv6, así que trae 4 octetos.
    const octets = tail.split(".").map(Number) as [number, number, number, number];
    const hi = ((octets[0] << 8) | octets[1]).toString(16);
    const lo = ((octets[2] << 8) | octets[3]).toString(16);
    address = `${address.slice(0, lastColonIndex + 1)}${hi}:${lo}`;
  }

  const hasCompression = address.includes("::");
  const left = hasCompression ? address.split("::")[0]! : address;
  const right = hasCompression ? address.split("::")[1]! : undefined;
  const leftGroups = left === "" ? [] : left.split(":");
  const rightGroups = right === undefined ? [] : right === "" ? [] : right.split(":");
  const missing = 8 - leftGroups.length - rightGroups.length;
  const fullGroups =
    right === undefined ? leftGroups : [...leftGroups, ...Array(missing).fill("0"), ...rightGroups];

  return fullGroups.map((g) => g.padStart(4, "0")).join(":");
}
