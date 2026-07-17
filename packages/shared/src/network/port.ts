import { z } from "zod";

/** Puerto de transporte TCP/UDP válido (0–65535). */
export const PortSchema = z.coerce.number().int().min(0).max(65535).brand<"Port">();

export type Port = z.infer<typeof PortSchema>;

export type PortRange = "WELL_KNOWN" | "REGISTERED" | "DYNAMIC";

/** Clasificación IANA de rangos de puertos. */
export function classifyPort(port: number): PortRange {
  if (port < 0 || port > 65535 || !Number.isInteger(port)) {
    throw new Error(`Puerto fuera de rango (0-65535): ${port}`);
  }
  if (port <= 1023) return "WELL_KNOWN";
  if (port <= 49151) return "REGISTERED";
  return "DYNAMIC";
}
