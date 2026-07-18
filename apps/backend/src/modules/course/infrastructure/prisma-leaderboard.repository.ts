import { Injectable } from "@nestjs/common";
import { prisma } from "@network-learning-game/database";
import type { LeaderboardRepository, LeaderboardRow } from "../domain/leaderboard.repository.js";

@Injectable()
export class PrismaLeaderboardRepository implements LeaderboardRepository {
  async getGlobalTop(limit: number): Promise<LeaderboardRow[]> {
    const users = await prisma.user.findMany({
      orderBy: { totalXp: "desc" },
      take: limit,
      select: { id: true, displayName: true, totalXp: true },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      displayName: user.displayName,
      xp: user.totalXp,
    }));
  }

  async getClassroomTop(classroomId: string, limit: number): Promise<LeaderboardRow[]> {
    const memberships = await prisma.classroomMembership.findMany({
      where: { classroomId },
      include: { user: { select: { id: true, displayName: true, totalXp: true } } },
      orderBy: { user: { totalXp: "desc" } },
      take: limit,
    });

    return memberships.map((membership, index) => ({
      rank: index + 1,
      userId: membership.user.id,
      displayName: membership.user.displayName,
      xp: membership.user.totalXp,
    }));
  }
}
