import type { CourseDetail, CourseSummary } from "./course.js";

export interface CourseRepository {
  listPublished(): Promise<CourseSummary[]>;
  findBySlug(slug: string): Promise<CourseDetail | null>;
}

export const COURSE_REPOSITORY = Symbol("COURSE_REPOSITORY");
