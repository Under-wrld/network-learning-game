import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { prisma } from "@network-learning-game/database";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SimulatorModule } from "../../src/modules/simulator/simulator.module.js";
import { createRealTestUser, deleteRealTestUser, type RealTestUser } from "../support/supabase-test-auth.js";

// Misma solución de referencia verificada en packages/simulations.
const CORRECT_ANSWER = [
  { requirementId: "ventas", cidr: "192.168.1.0/25" },
  { requirementId: "ingenieria", cidr: "192.168.1.128/26" },
  { requirementId: "contabilidad", cidr: "192.168.1.192/27" },
  { requirementId: "enlace-ab", cidr: "192.168.1.224/30" },
];

const WRONG_ANSWER = [
  { requirementId: "ventas", cidr: "192.168.1.0/27" }, // insuficientes hosts a propósito
  { requirementId: "ingenieria", cidr: "192.168.1.128/26" },
  { requirementId: "contabilidad", cidr: "192.168.1.192/27" },
  { requirementId: "enlace-ab", cidr: "192.168.1.224/30" },
];

describe("Módulo Simulator Engine (e2e — VLSM real, HTTP + Supabase Auth + DB reales)", () => {
  let app: INestApplication;
  let labId: string;
  let labMaxXp: number;
  let realUser: RealTestUser;

  beforeAll(async () => {
    const lab = await prisma.lab.findFirstOrThrow({ where: { simulatorKey: "vlsm" } });
    labId = lab.id;
    labMaxXp = lab.maxXp;

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              NODE_ENV: "test",
              API_PORT: 3001,
              DATABASE_URL: process.env.DATABASE_URL,
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            }),
          ],
        }),
        SimulatorModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    realUser = await createRealTestUser("simulator-e2e");
    await prisma.user.create({ data: { id: realUser.id, email: realUser.email } });
  });

  afterAll(async () => {
    await prisma.labAttempt.deleteMany({ where: { userId: realUser.id } });
    await prisma.xPTransaction.deleteMany({ where: { userId: realUser.id } });
    await prisma.user.deleteMany({ where: { id: realUser.id } });
    await deleteRealTestUser(realUser.id);
    await app.close();
  });

  it("GET /labs/:id devuelve el ejercicio VLSM sembrado (sin requerir auth)", async () => {
    const response = await request(app.getHttpServer()).get(`/labs/${labId}`).expect(200);
    expect(response.body.simulatorKey).toBe("vlsm");
    expect(response.body.initialState.baseNetwork).toBe("192.168.1.0/24");
  });

  it("POST /labs/:id/attempts sin token es rechazado", async () => {
    await request(app.getHttpServer()).post(`/labs/${labId}/attempts`).send(CORRECT_ANSWER).expect(401);
  });

  it("una asignación incorrecta se marca FAILED, sin XP", async () => {
    const response = await request(app.getHttpServer())
      .post(`/labs/${labId}/attempts`)
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .send(WRONG_ANSWER)
      .expect(201);

    expect(response.body.status).toBe("FAILED");
    expect(response.body.xpAwarded).toBe(0);
    expect(response.body.errors.some((e: { code: string }) => e.code === "INSUFFICIENT_HOSTS")).toBe(true);

    const profile = await prisma.user.findUniqueOrThrow({ where: { id: realUser.id } });
    expect(profile.totalXp).toBe(0);
  });

  it("la solución correcta se marca PASSED, otorga XP y actualiza la racha", async () => {
    const response = await request(app.getHttpServer())
      .post(`/labs/${labId}/attempts`)
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .send(CORRECT_ANSWER)
      .expect(201);

    expect(response.body.status).toBe("PASSED");
    expect(response.body.score).toBe(100);
    expect(response.body.xpAwarded).toBe(labMaxXp);
    expect(response.body.errors).toEqual([]);

    const profile = await prisma.user.findUniqueOrThrow({ where: { id: realUser.id } });
    expect(profile.totalXp).toBe(labMaxXp);
    expect(profile.currentStreak).toBe(1);

    const transactions = await prisma.xPTransaction.findMany({ where: { userId: realUser.id } });
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({ amount: labMaxXp, sourceType: "LAB_COMPLETION", sourceId: labId });
  });

  it("reenviar la misma solución correcta no otorga XP de nuevo", async () => {
    const response = await request(app.getHttpServer())
      .post(`/labs/${labId}/attempts`)
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .send(CORRECT_ANSWER)
      .expect(201);

    expect(response.body.status).toBe("PASSED");
    expect(response.body.xpAwarded).toBe(0);

    const profile = await prisma.user.findUniqueOrThrow({ where: { id: realUser.id } });
    expect(profile.totalXp).toBe(labMaxXp); // sin cambios respecto al intento anterior
  });
});
