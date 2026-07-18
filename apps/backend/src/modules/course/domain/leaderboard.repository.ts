export interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string | null;
  xp: number;
}

/**
 * Lee User.totalXp en vivo (ORDER BY totalXp DESC LIMIT n). El modelo
 * LeaderboardEntry (packages/database) queda como caché para cuando el
 * volumen de usuarios lo justifique — ver DECISIONS.md; no se implementó el
 * job de recomputo en esta fase.
 */
export interface LeaderboardRepository {
  getGlobalTop(limit: number): Promise<LeaderboardRow[]>;
  getClassroomTop(classroomId: string, limit: number): Promise<LeaderboardRow[]>;
}

export const LEADERBOARD_REPOSITORY = Symbol("LEADERBOARD_REPOSITORY");
