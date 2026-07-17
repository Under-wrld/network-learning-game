import { z } from "zod";
import { IdSchema } from "./common.dto.js";

export const LevelSchema = z.object({
  id: IdSchema,
  chapterId: IdSchema,
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  order: z.number().int().min(0),
  xpReward: z.number().int().min(0),
});
export type Level = z.infer<typeof LevelSchema>;

export const ChapterSchema = z.object({
  id: IdSchema,
  courseId: IdSchema,
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  tanenbaumChapter: z.number().int().min(1).max(8).nullable(),
  order: z.number().int().min(0),
  levels: z.array(LevelSchema).optional(),
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const CourseSchema = z.object({
  id: IdSchema,
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  order: z.number().int().min(0),
  isPublished: z.boolean(),
  chapters: z.array(ChapterSchema).optional(),
});
export type Course = z.infer<typeof CourseSchema>;
