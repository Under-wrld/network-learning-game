import type { ClassroomSummary } from "./classroom.js";

export interface ClassroomRepository {
  create(teacherId: string, name: string): Promise<ClassroomSummary>;
  joinByCode(userId: string, joinCode: string): Promise<ClassroomSummary>;
  listTaughtBy(teacherId: string): Promise<ClassroomSummary[]>;
  listJoinedBy(userId: string): Promise<ClassroomSummary[]>;
}

export const CLASSROOM_REPOSITORY = Symbol("CLASSROOM_REPOSITORY");
