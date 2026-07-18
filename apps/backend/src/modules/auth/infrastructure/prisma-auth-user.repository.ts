import { Injectable } from "@nestjs/common";
import { Prisma, prisma, type User as PrismaUser } from "@network-learning-game/database";
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
    // Solo sincroniza identidad (email/existencia). No toca lastActivityAt:
    // ese campo alimenta la racha diaria (módulo User) y debe reflejar
    // actividad real (completar un lab, etc.), no la mera autenticación de
    // cada request — el guard corre en todas las llamadas protegidas.
    try {
      const user = await prisma.user.upsert({
        where: { id: input.id },
        update: { email: input.email },
        create: { id: input.id, email: input.email, role: "STUDENT" },
      });
      return toAuthenticatedUser(user);
    } catch (error) {
      // El primer login autenticado de un usuario nuevo puede disparar dos
      // requests concurrentes al backend (p. ej. el prefetch automático de
      // Next.js Link sobre otra ruta que también sincroniza el perfil). El
      // `ON CONFLICT` del upsert solo cubre la unicidad de `id`: si dos
      // creaciones compiten, la segunda puede chocar contra la unicidad de
      // `email` en vez de convertirse en un update. Ambas escriben el mismo
      // id + email, así que basta releer la fila que ya escribió la ganadora.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const user = await prisma.user.findUniqueOrThrow({ where: { id: input.id } });
        return toAuthenticatedUser(user);
      }
      throw error;
    }
  }
}
