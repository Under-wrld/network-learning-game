import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { prisma } from "@network-learning-game/database";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { UserModule } from "../../src/modules/user/user.module.js";
import { createRealTestUser, deleteRealTestUser, type RealTestUser } from "../support/supabase-test-auth.js";

describe("Módulo User (e2e — HTTP real contra la app, Supabase Auth y la base de datos reales)", () => {
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
        UserModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    realUser = await createRealTestUser("user-e2e");
    // El guard de Auth sincroniza al primer request autenticado; lo disparamos
    // vía /users/me en vez de duplicar la lógica de upsert acá.
  });

  afterAll(async () => {
    await prisma.xPTransaction.deleteMany({ where: { userId: realUser.id } });
    await prisma.user.deleteMany({ where: { id: realUser.id } });
    await deleteRealTestUser(realUser.id);
    await app.close();
  });

  it("GET /users/me sincroniza al usuario (vía el guard) y devuelve su perfil", async () => {
    const response = await request(app.getHttpServer())
      .get("/users/me")
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: realUser.id,
      email: realUser.email,
      role: "STUDENT",
      totalXp: 0,
      level: 0,
    });
  });

  it("PATCH /users/me actualiza displayName con validación Zod", async () => {
    const response = await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .send({ displayName: "Estudiante E2E" })
      .expect(200);

    expect(response.body.displayName).toBe("Estudiante E2E");
  });

  it("PATCH /users/me rechaza un payload inválido (displayName vacío)", async () => {
    await request(app.getHttpServer())
      .patch("/users/me")
      .set("Authorization", `Bearer ${realUser.accessToken}`)
      .send({ displayName: "" })
      .expect(400);
  });

  it("GET /users/me sin token es rechazado", async () => {
    await request(app.getHttpServer()).get("/users/me").expect(401);
  });
});
