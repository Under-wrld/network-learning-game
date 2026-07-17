import { Injectable } from "@nestjs/common";
import { prisma, type User as PrismaUser } from "@network-learning-game/database";
import type { Role } from "@network-learning-game/shared";
import type { AuthUserRepository, UpsertAuthUserInput } from "../domain/auth-user.repository.js";
import type { AuthenticatedUser } from "../domain/authenticated-user.js";

/**
 * Traduce entre el Role generado por Prisma (packages/database) y el Role
 * independiente de packages/shared — ambos son el mismo string union por
 * diseño (ver DECISIONS.md), pero se mapea explícitamente para no acoplar
 * el dominio de Auth al tipo generado por el ORM.
 */
function toAuthenticatedUser(user: PrismaUser): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role as Role,
    totalXp: user.totalXp,
    currentStreak: user.currentStreak,
  };
}

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  async findById(id: string): Promise<AuthenticatedUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toAuthenticatedUser(user) : null;
  }

  async upsertFromClaims(input: UpsertAuthUserInput): Promise<AuthenticatedUser> {
    const user = await prisma.user.upsert({
      where: { id: input.id },
      update: { email: input.email, lastActivityAt: new Date() },
      create: {
        id: input.id,
        email: input.email,
        role: "STUDENT",
        lastActivityAt: new Date(),
      },
    });
    return toAuthenticatedUser(user);
  }
}
