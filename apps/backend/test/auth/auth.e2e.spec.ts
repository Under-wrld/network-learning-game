import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { prisma } from "@network-learning-game/database";
import { generateKeyPair, SignJWT } from "jose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthModule } from "../../src/modules/auth/auth.module.js";
import { createRealTestUser, deleteRealTestUser, type RealTestUser } from "../support/supabase-test-auth.js";

describe("Módulo Auth (e2e — HTTP real contra la app, Supabase Auth y la base de datos reales)", () => {
  let app: INestApplication;
  let realUser: RealTestUser;

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
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            }),
          ],
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    realUser = await createRealTestUser("auth-e2e");
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: realUser.id } });
    await deleteRealTestUser(realUser.id);
    await app.close();
  });

  it("rechaza una request sin header Authorization", async () => {
    await request(app.getHttpServer()).get("/auth/me").expect(401);
  });

  it("rechaza un token firmado con una clave que no está en el JWKS del proyecto", async () => {
    const { privateKey } = await generateKeyPair("ES256");
    const untrustedToken = await new SignJWT({ email: "attacker@example.com" })
      .setProtectedHeader({ alg: "ES256", kid: "clave-no-registrada-en-supabase" })
      .setSubject(realUser.id)
      .setAudience("authenticated")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);

    await request(app.getHttpServer()).get("/auth/me").set("Authorization", `Bearer ${untrustedToken}`).expect(401);
  });

  it("acepta un token real de Supabase, sincroniza el perfil en la DB real y lo devuelve", async () => {
    const response = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .expect(200);

    expect(response.body).toEqual({
      id: realUser.id,
      email: realUser.email,
      role: "STUDENT",
      totalXp: 0,
      currentStreak: 0,
    });

    const stored = await prisma.user.findUnique({ where: { id: realUser.id } });
    expect(stored?.email).toBe(realUser.email);
  });
});
