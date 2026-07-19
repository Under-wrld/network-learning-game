/**
 * Títulos narrativos por nivel — capa puramente presentacional sobre
 * xpForLevel/levelForXp (misma fórmula, XP = 100 × nivel^1.5). No confundir
 * con el modelo `Level` de Prisma (una lección del currículo): esto es el
 * "nivel de jugador" derivado de `User.totalXp`.
 */

export interface LevelTier {
  /** Nivel de jugador mínimo (inclusive) al que aplica este título. */
  minLevel: number;
  title: string;
}

// Última entrada (30) actúa de techo narrativo; niveles más altos reusan su título.
const LEVEL_TIERS: readonly LevelTier[] = [
  { minLevel: 0, title: "Network Novice" },
  { minLevel: 2, title: "Cable Runner" },
  { minLevel: 4, title: "Packet Handler" },
  { minLevel: 6, title: "Frame Weaver" },
  { minLevel: 8, title: "Switch Operator" },
  { minLevel: 10, title: "Routing Master" },
  { minLevel: 13, title: "Protocol Architect" },
  { minLevel: 16, title: "Network Engineer" },
  { minLevel: 20, title: "Systems Sage" },
  { minLevel: 25, title: "Internet Architect" },
  { minLevel: 30, title: "Network Grandmaster" },
];

export function levelTitle(playerLevel: number): string {
  if (!Number.isInteger(playerLevel) || playerLevel < 0) {
    throw new Error(`Nivel inválido: ${playerLevel}`);
  }
  // El primer tier tiene minLevel 0 y playerLevel ya se validó >= 0 arriba,
  // así que siempre hay al menos un tier aplicable.
  const applicable = LEVEL_TIERS.filter((tier) => playerLevel >= tier.minLevel).at(-1);
  return applicable!.title;
}
