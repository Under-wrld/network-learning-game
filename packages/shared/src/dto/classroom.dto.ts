import { z } from "zod";
import { IdSchema } from "./common.dto.js";

export const ClassroomSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(120),
  joinCode: z.string().min(4).max(16),
  teacherId: IdSchema,
  createdAt: z.iso.datetime(),
});
export type Classroom = z.infer<typeof ClassroomSchema>;

export const CreateClassroomSchema = z.object({
  name: z.string().min(1).max(120),
});
export type CreateClassroom = z.infer<typeof CreateClassroomSchema>;

export const JoinClassroomSchema = z.object({
  joinCode: z.string().min(4).max(16),
});
export type JoinClassroom = z.infer<typeof JoinClassroomSchema>;
