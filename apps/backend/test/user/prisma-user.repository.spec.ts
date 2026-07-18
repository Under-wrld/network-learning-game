import { randomUUID } from "node:crypto";
import { prisma } from "@network-learning-game/database";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaUserRepository } from "../../src/modules/user/infrastructure/prisma-user.repository.js";

describe("PrismaUserRepository (integración contra Supabase real, sin mocks)", () => {
  const repository = new PrismaUserRepository();
  const userId = randomUUID();
  const email = `vitest-user-${userId}@example.com`;

  beforeAll(async () => {
    await prisma.user.create({ data: { id: userId, email } });
  });

  afterAll(async () => {
    await prisma.xPTransaction.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("findById devuelve el perfil con nivel derivado", async () => {
    const profile = await repository.findById(userId);
    expect(profile?.email).toBe(email);
    expect(profile?.level).toBe(0);
    expect(profile?.totalXp).toBe(0);
  });

  it("updateProfile actualiza displayName y avatarUrl", async () => {
    const profile = await repository.updateProfile(userId, {
      displayName: "Estudiante Vitest",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(profile.displayName).toBe("Estudiante Vitest");
    expect(profile.avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("awardXp incrementa totalXp y deja un XPTransaction de auditoría", async () => {
    const profile = await repository.awardXp({
      userId,
      amount: 150,
      reason: "Laboratorio completado",
      sourceType: "LAB_COMPLETION",
      sourceId: "lab-test-id",
    });

    expect(profile.totalXp).toBe(150);
    expect(profile.level).toBe(1);

    const transactions = await prisma.xPTransaction.findMany({ where: { userId } });
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      amount: 150,
      reason: "Laboratorio completado",
      sourceType: "LAB_COMPLETION",
      sourceId: "lab-test-id",
    });
  });

  it("awardXp acumula sobre XP previo", async () => {
    const profile = await repository.awardXp({
      userId,
      amount: 200,
      reason: "Quest diaria",
      sourceType: "DAILY_QUEST",
    });
    expect(profile.totalXp).toBe(350);
  });

  it("recordActivity inicia la racha en 1 la primera vez", async () => {
    const profile = await repository.recordActivity(userId, new Date());
    expect(profile.currentStreak).toBe(1);
    expect(profile.longestStreak).toBe(1);
  });

  it("recordActivity el mismo día no incrementa la racha", async () => {
    const before = await repository.findById(userId);
    const after = await repository.recordActivity(userId, new Date());
    expect(after.currentStreak).toBe(before?.currentStreak);
  });
});
