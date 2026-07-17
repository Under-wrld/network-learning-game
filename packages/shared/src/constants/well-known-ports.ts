/**
 * Puertos bien conocidos (0–1023) de uso frecuente en el temario de Redes I
 * (Tanenbaum cap. 6–7). Asignaciones reales de IANA, no inventadas.
 */
export const WELL_KNOWN_PORTS = {
  20: { protocol: "TCP", service: "FTP (datos)" },
  21: { protocol: "TCP", service: "FTP (control)" },
  22: { protocol: "TCP", service: "SSH" },
  23: { protocol: "TCP", service: "Telnet" },
  25: { protocol: "TCP", service: "SMTP" },
  53: { protocol: "TCP/UDP", service: "DNS" },
  67: { protocol: "UDP", service: "DHCP (servidor)" },
  68: { protocol: "UDP", service: "DHCP (cliente)" },
  69: { protocol: "UDP", service: "TFTP" },
  80: { protocol: "TCP", service: "HTTP" },
  110: { protocol: "TCP", service: "POP3" },
  119: { protocol: "TCP", service: "NNTP" },
  123: { protocol: "UDP", service: "NTP" },
  143: { protocol: "TCP", service: "IMAP" },
  161: { protocol: "UDP", service: "SNMP" },
  162: { protocol: "UDP", service: "SNMP (traps)" },
  179: { protocol: "TCP", service: "BGP" },
  443: { protocol: "TCP", service: "HTTPS" },
  514: { protocol: "UDP", service: "Syslog" },
  993: { protocol: "TCP", service: "IMAPS" },
  995: { protocol: "TCP", service: "POP3S" },
} as const satisfies Record<number, { protocol: string; service: string }>;

export type WellKnownPort = keyof typeof WELL_KNOWN_PORTS;

export function lookupWellKnownPort(port: number): { protocol: string; service: string } | undefined {
  return WELL_KNOWN_PORTS[port as WellKnownPort];
}
