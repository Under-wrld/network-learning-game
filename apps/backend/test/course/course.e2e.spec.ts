import type { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { prisma } from "@network-learning-game/database";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CourseModule } from "../../src/modules/course/course.module.js";
import { createRealTestUser, deleteRealTestUser, type RealTestUser } from "../support/supabase-test-auth.js";

const SEEDED_COURSE_SLUG = "redes-de-computadoras-i";

describe("Módulo Course/Gamification (e2e — HTTP real contra la app, Supabase Auth y la base de datos reales)", () => {
  let app: INestApplication;

  let student: RealTestUser;
  let teacher: RealTestUser;

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
        CourseModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    student = await createRealTestUser("student-course-e2e");
    teacher = await createRealTestUser("teacher-course-e2e");

    // Se pre-crean con el rol correcto: el guard solo sincroniza email en un
    // upsert existente (nunca pisa el role), así que el TEACHER se preserva.
    await prisma.user.create({ data: { id: student.id, email: student.email, role: "STUDENT" } });
    await prisma.user.create({ data: { id: teacher.id, email: teacher.email, role: "TEACHER" } });
  });

  afterAll(async () => {
    await prisma.classroomMembership.deleteMany({ where: { userId: { in: [student.id, teacher.id] } } });
    await prisma.classroom.deleteMany({ where: { teacherId: teacher.id } });
    await prisma.courseEnrollment.deleteMany({ where: { userId: student.id } });
    await prisma.user.deleteMany({ where: { id: { in: [student.id, teacher.id] } } });
    await Promise.all([deleteRealTestUser(student.id), deleteRealTestUser(teacher.id)]);
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
        .set("Authorization", `Bearer ${student.accessToken}`)
        .expect(201);
      expect(response.body.userId).toBe(student.id);
    });

    it("una segunda inscripción al mismo curso devuelve 409", async () => {
      await request(app.getHttpServer())
        .post(`/courses/${SEEDED_COURSE_SLUG}/enroll`)
        .set("Authorization", `Bearer ${student.accessToken}`)
        .expect(409);
    });
  });

  describe("leaderboard", () => {
    it("GET /leaderboard/global incluye a los usuarios de prueba ordenados por XP", async () => {
      await prisma.user.update({ where: { id: student.id }, data: { totalXp: 500 } });
      await prisma.user.update({ where: { id: teacher.id }, data: { totalXp: 200 } });

      const response = await request(app.getHttpServer()).get("/leaderboard/global?limit=100").expect(200);
      const studentEntry = response.body.find((r: { userId: string }) => r.userId === student.id);
      const teacherEntry = response.body.find((r: { userId: string }) => r.userId === teacher.id);

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
        .set("Authorization", `Bearer ${student.accessToken}`)
        .send({ name: "Aula ilegal" })
        .expect(403);
    });

    it("un TEACHER crea un aula con joinCode", async () => {
      const response = await request(app.getHttpServer())
        .post("/classrooms")
        .set("Authorization", `Bearer ${teacher.accessToken}`)
        .send({ name: "Redes I - Comisión A" })
        .expect(201);

      expect(response.body.joinCode).toMatch(/^[A-Z0-9]{6}$/);
      joinCode = response.body.joinCode;
    });

    it("un STUDENT se une al aula con el joinCode", async () => {
      const response = await request(app.getHttpServer())
        .post("/classrooms/join")
        .set("Authorization", `Bearer ${student.accessToken}`)
        .send({ joinCode })
        .expect(201);
      expect(response.body.memberCount).toBe(1);
    });

    it("unirse dos veces al mismo aula devuelve 409", async () => {
      await request(app.getHttpServer())
        .post("/classrooms/join")
        .set("Authorization", `Bearer ${student.accessToken}`)
        .send({ joinCode })
        .expect(409);
    });

    it("GET /classrooms/mine devuelve el aula correcta para cada rol", async () => {
      const teacherView = await request(app.getHttpServer())
        .get("/classrooms/mine")
        .set("Authorization", `Bearer ${teacher.accessToken}`)
        .expect(200);
      expect(teacherView.body).toHaveLength(1);
      expect(teacherView.body[0].joinCode).toBe(joinCode);

      const studentView = await request(app.getHttpServer())
        .get("/classrooms/mine")
        .set("Authorization", `Bearer ${student.accessToken}`)
        .expect(200);
      expect(studentView.body).toHaveLength(1);
      expect(studentView.body[0].joinCode).toBe(joinCode);
    });
  });
});
