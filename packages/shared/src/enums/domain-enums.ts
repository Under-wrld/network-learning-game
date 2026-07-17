import { z } from "zod";

/**
 * Estos enums reflejan intencionalmente los del schema de Prisma
 * (packages/database) pero se definen de forma independiente: packages/shared
 * lo consume tanto apps/frontend como apps/backend, y el frontend nunca debe
 * depender de @prisma/client (arrastraría el motor nativo de Prisma a un
 * bundle de navegador). La capa de infraestructura del backend (Fase 4) es
 * responsable de mapear entre ambos en el límite del repositorio.
 */

export const RoleSchema = z.enum(["STUDENT", "TEACHER", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;

export const AttemptStatusSchema = z.enum(["IN_PROGRESS", "SUBMITTED", "PASSED", "FAILED"]);
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>;

export const AssessmentTypeSchema = z.enum(["QUIZ", "OPEN_CHALLENGE"]);
export type AssessmentType = z.infer<typeof AssessmentTypeSchema>;

export const LeaderboardScopeSchema = z.enum(["GLOBAL", "CLASSROOM"]);
export type LeaderboardScope = z.infer<typeof LeaderboardScopeSchema>;
