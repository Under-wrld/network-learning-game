export interface StreakState {
  currentStreak: number;
  longestStreak: number;
}

function toUtcDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(earlier: string, later: string): number {
  const msPerDay = 86_400_000;
  return Math.round((new Date(later).getTime() - new Date(earlier).getTime()) / msPerDay);
}

/**
 * Racha diaria estilo Duolingo, comparando días calendario en UTC (una
 * simplificación conocida — no ajusta por zona horaria del usuario; ver
 * DECISIONS.md). Reglas:
 * - Misma fecha que la última actividad: la racha no cambia.
 * - Exactamente un día después: +1.
 * - Cualquier otro caso (primera actividad o hueco > 1 día): resetea a 1.
 */
export function computeNextStreak(params: {
  lastActivityAt: Date | null;
  now: Date;
  current: StreakState;
}): StreakState {
  const { lastActivityAt, now, current } = params;
  const today = toUtcDateOnly(now);

  if (lastActivityAt === null) {
    return { currentStreak: 1, longestStreak: Math.max(current.longestStreak, 1) };
  }

  const lastDay = toUtcDateOnly(lastActivityAt);
  if (lastDay === today) {
    return current;
  }

  const gap = daysBetween(lastDay, today);
  const currentStreak = gap === 1 ? current.currentStreak + 1 : 1;
  return { currentStreak, longestStreak: Math.max(current.longestStreak, currentStreak) };
}
