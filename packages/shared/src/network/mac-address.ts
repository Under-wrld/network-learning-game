import { z } from "zod";

const MAC_PATTERN = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;

/** Valida una dirección MAC de 48 bits en notación XX:XX:XX:XX:XX:XX o XX-XX-XX-XX-XX-XX. */
export function isValidMacAddress(value: string): boolean {
  return typeof value === "string" && MAC_PATTERN.test(value);
}

export const MacAddressSchema = z
  .string()
  .refine(isValidMacAddress, { message: "Dirección MAC inválida (esperado XX:XX:XX:XX:XX:XX)" })
  .brand<"MacAddress">();

export type MacAddress = z.infer<typeof MacAddressSchema>;

function firstOctet(mac: string): number {
  if (!isValidMacAddress(mac)) {
    throw new Error(`Dirección MAC inválida: "${mac}"`);
  }
  // isValidMacAddress ya garantizó el formato de 6 grupos hex.
  return Number.parseInt(mac.split(/[:-]/)[0]!, 16);
}

/** Bit I/G (menos significativo del primer octeto): 0 = unicast, 1 = multicast/broadcast. */
export function isUnicastMac(mac: string): boolean {
  return (firstOctet(mac) & 0b0000_0001) === 0;
}

export function isMulticastMac(mac: string): boolean {
  return !isUnicastMac(mac);
}

/** FF:FF:FF:FF:FF:FF — broadcast de la subcapa MAC (802.3). */
export function isBroadcastMac(mac: string): boolean {
  return normalizeMacAddress(mac) === "ff:ff:ff:ff:ff:ff";
}

/** Bit U/L (segundo menos significativo del primer octeto): 0 = administrada globalmente (OUI del fabricante), 1 = administrada localmente. */
export function isLocallyAdministeredMac(mac: string): boolean {
  return (firstOctet(mac) & 0b0000_0010) !== 0;
}

/** Normaliza separador a ":" y pasa a minúsculas, para comparación/almacenamiento consistente. */
export function normalizeMacAddress(mac: string): string {
  if (!isValidMacAddress(mac)) {
    throw new Error(`Dirección MAC inválida: "${mac}"`);
  }
  return mac.replace(/-/g, ":").toLowerCase();
}
