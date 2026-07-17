import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { prisma } from "@network-learning-game/database";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthModule } from "../../src/modules/auth/auth.module.js";

const TEST_SECRET = "vitest-auth-e2e-test-secret";

describe("Módulo Auth (e2e — HTTP real contra la app y la base de datos reales)", () => {
  let app: INestApplication;
  const userId = randomUUID();
  const email = `e2e-${userId}@example.com`;

  beforeAll(async () => {
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
              SUPABASE_JWT_SECRET: TEST_SECRET,
            }),
          ],
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it("rechaza una request sin header Authorization", async () => {
    await request(app.getHttpServer()).get("/auth/me").expect(401);
  });

  it("rechaza un token firmado con un secreto incorrecto", async () => {
    const badToken = jwt.sign({ sub: userId, email }, "secreto-incorrecto", { algorithm: "HS256" });
    await request(app.getHttpServer()).get("/auth/me").set("Authorization", `Bearer ${badToken}`).expect(401);
  });

  it("acepta un token válido, sincroniza el perfil en la DB real y lo devuelve", async () => {
    const token = jwt.sign({ sub: userId, email }, TEST_SECRET, { algorithm: "HS256", expiresIn: "1h" });

    const response = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      id: userId,
      email,
      role: "STUDENT",
      totalXp: 0,
      currentStreak: 0,
    });

    const stored = await prisma.user.findUnique({ where: { id: userId } });
    expect(stored?.email).toBe(email);
  });
});
