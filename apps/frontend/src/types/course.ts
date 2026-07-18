// Espejo de apps/backend/src/modules/course/domain/course.ts — tipo interno
// del backend, no exportado como paquete (a diferencia de los DTOs Zod de
// packages/shared, que son para validar requests, no para reflejar cada
// forma de response).

export interface LevelSummary {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  labId: string | null;
}

export interface ChapterDetail {
  id: string;
  title: string;
  description: string;
  tanenbaumChapter: number | null;
  order: number;
  levels: LevelSummary[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  chapterCount: number;
}

export interface CourseDetail extends CourseSummary {
  chapters: ChapterDetail[];
}
