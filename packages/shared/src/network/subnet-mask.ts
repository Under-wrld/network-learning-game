import { z } from "zod";
import { intToIpv4, ipv4ToInt, isValidIpv4 } from "./ipv4.js";

function toBinary32(value: number): string {
  return (value >>> 0).toString(2).padStart(32, "0");
}

/**
 * Una máscara de subred válida es una IPv4 cuya representación binaria es un
 * prefijo contiguo de 1s seguido de 0s (sin huecos), p. ej. 255.255.255.0.
 */
export function isValidSubnetMask(value: string): boolean {
  if (!isValidIpv4(value)) return false;
  return /^1*0*$/.test(toBinary32(ipv4ToInt(value)));
}

export const SubnetMaskSchema = z
  .string()
  .refine(isValidSubnetMask, {
    message: "Máscara de subred inválida (debe ser un prefijo contiguo de 1s, p. ej. 255.255.255.0)",
  })
  .brand<"SubnetMask">();

export type SubnetMask = z.infer<typeof SubnetMaskSchema>;

/** Cuenta de bits en 1 (longitud de prefijo CIDR) de una máscara válida. */
export function maskToPrefixLength(mask: string): number {
  if (!isValidSubnetMask(mask)) {
    throw new Error(`No se puede derivar el prefijo de una máscara inválida: "${mask}"`);
  }
  return toBinary32(ipv4ToInt(mask)).split("").filter((bit) => bit === "1").length;
}

/** Construye la máscara decimal punteada correspondiente a una longitud de prefijo (0–32). */
export function prefixLengthToMask(prefixLength: number): string {
  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error(`Longitud de prefijo fuera de rango (0-32): ${prefixLength}`);
  }
  const maskInt = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  return intToIpv4(maskInt);
}

/** Máscara wildcard (inversa) usada en ACLs de Cisco, p. ej. 255.255.255.0 → 0.0.0.255. */
export function maskToWildcard(mask: string): string {
  const maskInt = ipv4ToInt(mask);
  return intToIpv4((~maskInt) >>> 0);
}
