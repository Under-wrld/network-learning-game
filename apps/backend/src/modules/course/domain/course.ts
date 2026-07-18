export interface LevelSummary {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
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
