import { randomUUID } from "node:crypto";
import { prisma } from "@network-learning-game/database";
import { afterAll, describe, expect, it } from "vitest";
import { PrismaAuthUserRepository } from "../../src/modules/auth/infrastructure/prisma-auth-user.repository.js";

describe("PrismaAuthUserRepository (integración contra Supabase real, sin mocks)", () => {
  const repository = new PrismaAuthUserRepository();
  const testUserId = randomUUID();
  const testEmail = `vitest-${testUserId}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it("crea un usuario nuevo con rol STUDENT por defecto al hacer upsert", async () => {
    const user = await repository.upsertFromClaims({ id: testUserId, email: testEmail });

    expect(user).toEqual({
      id: testUserId,
      email: testEmail,
      role: "STUDENT",
      totalXp: 0,
      currentStreak: 0,
    });
  });

  it("encuentra el usuario recién creado por id", async () => {
    const found = await repository.findById(testUserId);
    expect(found?.email).toBe(testEmail);
  });

  it("en upserts subsecuentes actualiza el email sin resetear XP/rol", async () => {
    await prisma.user.update({ where: { id: testUserId }, data: { totalXp: 500, role: "TEACHER" } });

    const updatedEmail = `updated-${testEmail}`;
    const user = await repository.upsertFromClaims({ id: testUserId, email: updatedEmail });

    expect(user.email).toBe(updatedEmail);
    expect(user.totalXp).toBe(500);
    expect(user.role).toBe("TEACHER");
  });

  it("retorna null para un id que no existe", async () => {
    const found = await repository.findById(randomUUID());
    expect(found).toBeNull();
  });
});
