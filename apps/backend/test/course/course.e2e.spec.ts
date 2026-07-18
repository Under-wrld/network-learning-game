import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { prisma } from "@network-learning-game/database";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CourseModule } from "../../src/modules/course/course.module.js";

const TEST_SECRET = "vitest-course-e2e-test-secret";
const SEEDED_COURSE_SLUG = "redes-de-computadoras-i";

function signToken(sub: string, email: string): string {
  return jwt.sign({ sub, email }, TEST_SECRET, { algorithm: "HS256", expiresIn: "1h" });
}

describe("Módulo Course/Gamification (e2e — HTTP real contra la app y la base de datos reales)", () => {
  let app: INestApplication;

  const studentId = randomUUID();
  const studentEmail = `student-course-e2e-${studentId}@example.com`;
  let studentToken: string;

  const teacherId = randomUUID();
  const teacherEmail = `teacher-course-e2e-${teacherId}@example.com`;
  let teacherToken: string;

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
        CourseModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    await prisma.user.create({ data: { id: studentId, email: studentEmail, role: "STUDENT" } });
    await prisma.user.create({ data: { id: teacherId, email: teacherEmail, role: "TEACHER" } });
    studentToken = signToken(studentId, studentEmail);
    teacherToken = signToken(teacherId, teacherEmail);
  });

  afterAll(async () => {
    await prisma.classroomMembership.deleteMany({ where: { userId: { in: [studentId, teacherId] } } });
    await prisma.classroom.deleteMany({ where: { teacherId } });
    await prisma.courseEnrollment.deleteMany({ where: { userId: studentId } });
    await prisma.user.deleteMany({ where: { id: { in: [studentId, teacherId] } } });
    await app.close();
  });

  describe("catálogo de cursos", () => {
    it("GET /courses lista el curso sembrado (publicado)", async () => {
      const response = await request(app.getHttpServer()).get("/courses").expect(200);
      const slugs = response.body.map((c: { slug: string }) => c.slug);
      expect(slugs).toContain(SEEDED_COURSE_SLUG);
    });

    it("GET /courses/:slug devuelve los 8 capítulos de Tanenbaum", async () => {
      const response = await request(app.getHttpServer()).get(`/courses/${SEEDED_COURSE_SLUG}`).expect(200);
      expect(response.body.chapters).toHaveLength(8);
      expect(response.body.chapters[0].tanenbaumChapter).toBe(1);
    });

    it("GET /courses/:slug con slug inexistente devuelve 404", async () => {
      await request(app.getHttpServer()).get("/courses/no-existe").expect(404);
    });
  });

  describe("inscripción", () => {
    it("POST /courses/:slug/enroll sin token es rechazado", async () => {
      await request(app.getHttpServer()).post(`/courses/${SEEDED_COURSE_SLUG}/enroll`).expect(401);
    });

    it("POST /courses/:slug/enroll inscribe al estudiante autenticado", async () => {
      const response = await request(app.getHttpServer())
        .post(`/courses/${SEEDED_COURSE_SLUG}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(201);
      expect(response.body.userId).toBe(studentId);
    });

    it("una segunda inscripción al mismo curso devuelve 409", async () => {
      await request(app.getHttpServer())
        .post(`/courses/${SEEDED_COURSE_SLUG}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(409);
    });
  });

  describe("leaderboard", () => {
    it("GET /leaderboard/global incluye a los usuarios de prueba ordenados por XP", async () => {
      await prisma.user.update({ where: { id: studentId }, data: { totalXp: 500 } });
      await prisma.user.update({ where: { id: teacherId }, data: { totalXp: 200 } });

      const response = await request(app.getHttpServer()).get("/leaderboard/global?limit=100").expect(200);
      const studentEntry = response.body.find((r: { userId: string }) => r.userId === studentId);
      const teacherEntry = response.body.find((r: { userId: string }) => r.userId === teacherId);

      expect(studentEntry.xp).toBe(500);
      expect(teacherEntry.xp).toBe(200);
      expect(studentEntry.rank).toBeLessThan(teacherEntry.rank);
    });
  });

  describe("aulas (classrooms)", () => {
    let joinCode: string;

    it("un STUDENT no puede crear un aula (403)", async () => {
      await request(app.getHttpServer())
        .post("/classrooms")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ name: "Aula ilegal" })
        .expect(403);
    });

    it("un TEACHER crea un aula con joinCode", async () => {
      const response = await request(app.getHttpServer())
        .post("/classrooms")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({ name: "Redes I - Comisión A" })
        .expect(201);

      expect(response.body.joinCode).toMatch(/^[A-Z0-9]{6}$/);
      joinCode = response.body.joinCode;
    });

    it("un STUDENT se une al aula con el joinCode", async () => {
      const response = await request(app.getHttpServer())
        .post("/classrooms/join")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ joinCode })
        .expect(201);
      expect(response.body.memberCount).toBe(1);
    });

    it("unirse dos veces al mismo aula devuelve 409", async () => {
      await request(app.getHttpServer())
        .post("/classrooms/join")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ joinCode })
        .expect(409);
    });

    it("GET /classrooms/mine devuelve el aula correcta para cada rol", async () => {
      const teacherView = await request(app.getHttpServer())
        .get("/classrooms/mine")
        .set("Authorization", `Bearer ${teacherToken}`)
        .expect(200);
      expect(teacherView.body).toHaveLength(1);
      expect(teacherView.body[0].joinCode).toBe(joinCode);

      const studentView = await request(app.getHttpServer())
        .get("/classrooms/mine")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);
      expect(studentView.body).toHaveLength(1);
      expect(studentView.body[0].joinCode).toBe(joinCode);
    });
  });
});
