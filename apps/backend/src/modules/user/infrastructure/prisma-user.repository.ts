import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type User as PrismaUser } from "@network-learning-game/database";
import type { Role } from "@network-learning-game/shared";
import { computeNextStreak } from "../domain/streak.js";
import type { UpdateProfilePatch, UserRepository } from "../domain/user.repository.js";
import type { UserProfile } from "../domain/user-profile.js";
import { levelForXp } from "../domain/xp-progression.js";

function toUserProfile(user: PrismaUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role as Role,
    totalXp: user.totalXp,
    level: levelForXp(user.totalXp),
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActivityAt: user.lastActivityAt,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUserProfile(user) : null;
  }

  async updateProfile(id: string, patch: UpdateProfilePatch): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
        ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
      },
    });
    return toUserProfile(user);
  }

  async awardXp(input: {
    userId: string;
    amount: number;
    reason: string;
    sourceType: string;
    sourceId?: string;
  }): Promise<UserProfile> {
    const [, user] = await prisma.$transaction([
      prisma.xPTransaction.create({
        data: {
          userId: input.userId,
          amount: input.amount,
          reason: input.reason,
          sourceType: input.sourceType,
          sourceId: input.sourceId ?? null,
        },
      }),
      prisma.user.update({
        where: { id: input.userId },
        data: { totalXp: { increment: input.amount } },
      }),
    ]);
    return toUserProfile(user);
  }

  async recordActivity(id: string, now: Date): Promise<UserProfile> {
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Usuario no encontrado: ${id}`);
    }

    const { currentStreak, longestStreak } = computeNextStreak({
      lastActivityAt: current.lastActivityAt,
      now,
      current: { currentStreak: current.currentStreak, longestStreak: current.longestStreak },
    });

    const user = await prisma.user.update({
      where: { id },
      data: { currentStreak, longestStreak, lastActivityAt: now },
    });
    return toUserProfile(user);
  }
}
