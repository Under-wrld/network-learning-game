export type LabAttemptGrade = "PASSED" | "FAILED";

export interface ValidationErrorDetail {
  requirementId?: string;
  code: string;
  message: string;
}

export interface LabAttemptResult {
  id: string;
  labId: string;
  status: LabAttemptGrade;
  score: number;
  xpAwarded: number;
  submittedAt: Date;
  errors: ValidationErrorDetail[];
}
