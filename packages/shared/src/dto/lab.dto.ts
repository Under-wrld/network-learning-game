import { z } from "zod";
import { AttemptStatusSchema } from "../enums/domain-enums.js";
import { IdSchema } from "./common.dto.js";

/**
 * Forma genérica del estado de un laboratorio (jsonb en Prisma). Cada
 * simulador (packages/game-engine | packages/simulations) define y valida
 * su propio sub-esquema de estado; este es el envoltorio de transporte.
 */
export const LabStateSchema = z.record(z.string(), z.unknown());

export const LabSchema = z.object({
  id: IdSchema,
  levelId: IdSchema,
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  simulatorKey: z.string().min(1),
  initialState: LabStateSchema,
  maxXp: z.number().int().min(0),
});
export type Lab = z.infer<typeof LabSchema>;

export const SubmitLabAttemptSchema = z.object({
  labId: IdSchema,
  state: LabStateSchema,
});
export type SubmitLabAttempt = z.infer<typeof SubmitLabAttemptSchema>;

export const LabAttemptResultSchema = z.object({
  id: IdSchema,
  labId: IdSchema,
  status: AttemptStatusSchema,
  score: z.number().int().min(0).max(100).nullable(),
  xpAwarded: z.number().int().min(0),
  submittedAt: z.iso.datetime().nullable(),
});
export type LabAttemptResult = z.infer<typeof LabAttemptResultSchema>;
