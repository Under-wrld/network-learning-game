export interface Lab {
  id: string;
  levelId: string;
  title: string;
  description: string;
  simulatorKey: string;
  initialState: Record<string, unknown>;
  maxXp: number;
}

export interface LabAttemptResult {
  id: string;
  labId: string;
  status: "PASSED" | "FAILED";
  score: number;
  xpAwarded: number;
  submittedAt: string;
  errors: { requirementId?: string; code: string; message: string }[];
}
