import type { LabAttemptGrade } from "./lab-attempt.js";

export interface CreateLabAttemptInput {
  labId: string;
  userId: string;
  state: Record<string, unknown>;
  status: LabAttemptGrade;
  score: number;
  xpAwarded: number;
}

export interface LabAttemptRepository {
  create(input: CreateLabAttemptInput): Promise<{ id: string; submittedAt: Date }>;
  hasPassedAttempt(userId: string, labId: string): Promise<boolean>;
}

export const LAB_ATTEMPT_REPOSITORY = Symbol("LAB_ATTEMPT_REPOSITORY");
