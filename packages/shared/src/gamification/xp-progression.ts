/**
 * Motor de progresión XP/Nivel — CLAUDE.md §4 módulo 9: XP = 100 × nivel^1.5.
 * Umbral acumulado para ALCANZAR ese nivel; nivel 0 = 0 XP (estado inicial).
 * `xpForLevel`/`levelForXp` son inversas exactas entre sí.
 *
 * apps/backend tiene su propia copia interna (no exportada como paquete) en
 * modules/user/domain/xp-progression.ts, escrita antes de que el frontend
 * necesitara esta misma fórmula. Ambas implementan la única fórmula
 * publicada en CLAUDE.md y están cubiertas por tests — el riesgo de drift
 * es bajo, pero es una duplicación real, documentada en DECISIONS.md.
 */

export function xpForLevel(level: number): number {
  if (!Number.isInteger(level) || level < 0) {
    throw new Error(`Nivel inválido: ${level}`);
  }
  if (level === 0) return 0;
  return Math.round(100 * level ** 1.5);
}

export function levelForXp(totalXp: number): number {
  if (totalXp < 0) {
    throw new Error(`totalXp no puede ser negativo: ${totalXp}`);
  }

  let level = Math.floor((totalXp / 100) ** (1 / 1.5));
  while (xpForLevel(level + 1) <= totalXp) level++;
  while (level > 0 && xpForLevel(level) > totalXp) level--;
  return level;
}

export function xpToNextLevel(totalXp: number): {
  currentLevel: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  const currentLevel = levelForXp(totalXp);
  const xpAtCurrentLevel = xpForLevel(currentLevel);
  const xpAtNextLevel = xpForLevel(currentLevel + 1);
  return {
    currentLevel,
    xpIntoLevel: totalXp - xpAtCurrentLevel,
    xpForNextLevel: xpAtNextLevel - xpAtCurrentLevel,
  };
}
