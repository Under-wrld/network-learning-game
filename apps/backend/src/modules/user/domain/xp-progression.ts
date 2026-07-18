/**
 * Motor de progresión XP/Nivel — CLAUDE.md §4 módulo 9: XP = 100 × nivel^1.5.
 * Se interpreta como el umbral acumulado de XP para ALCANZAR ese nivel, con
 * nivel 0 = 0 XP (estado inicial de todo usuario nuevo). `xpForLevel` y
 * `levelForXp` son inversas exactas entre sí — cualquier otra interpretación
 * (p. ej. "nivel 1 = 0 XP" como caso especial) rompe esa relación.
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
  // Corrige errores de punto flotante cerca de los umbrales exactos.
  while (xpForLevel(level + 1) <= totalXp) level++;
  while (level > 0 && xpForLevel(level) > totalXp) level--;
  return level;
}

/** XP restante hasta el siguiente nivel, útil para barras de progreso en el dashboard. */
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
