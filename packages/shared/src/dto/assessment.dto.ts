import { z } from "zod";
import { AssessmentTypeSchema, AttemptStatusSchema } from "../enums/domain-enums.js";
import { IdSchema } from "./common.dto.js";

export const AssessmentQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).optional(),
});
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const AssessmentSchema = z.object({
  id: IdSchema,
  levelId: IdSchema,
  type: AssessmentTypeSchema,
  title: z.string().min(1).max(160),
  questions: z.array(AssessmentQuestionSchema).min(1),
  passingScore: z.number().int().min(0).max(100),
  maxXp: z.number().int().min(0),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

export const AssessmentAnswerSchema = z.object({
  questionId: z.string().min(1),
  response: z.union([z.string(), z.array(z.string())]),
});
export type AssessmentAnswer = z.infer<typeof AssessmentAnswerSchema>;

export const SubmitAssessmentAttemptSchema = z.object({
  assessmentId: IdSchema,
  answers: z.array(AssessmentAnswerSchema).min(1),
});
export type SubmitAssessmentAttempt = z.infer<typeof SubmitAssessmentAttemptSchema>;

export const AssessmentAttemptResultSchema = z.object({
  id: IdSchema,
  assessmentId: IdSchema,
  status: AttemptStatusSchema,
  score: z.number().int().min(0).max(100).nullable(),
  submittedAt: z.iso.datetime().nullable(),
});
export type AssessmentAttemptResult = z.infer<typeof AssessmentAttemptResultSchema>;
