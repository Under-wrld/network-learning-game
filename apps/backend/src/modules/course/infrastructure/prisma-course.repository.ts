import { Injectable } from "@nestjs/common";
import { prisma } from "@network-learning-game/database";
import type { CourseRepository } from "../domain/course.repository.js";
import type { CourseDetail, CourseSummary } from "../domain/course.js";

@Injectable()
export class PrismaCourseRepository implements CourseRepository {
  async listPublished(): Promise<CourseSummary[]> {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { chapters: true } } },
    });

    return courses.map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      chapterCount: course._count.chapters,
    }));
  }

  async findBySlug(slug: string): Promise<CourseDetail | null> {
    const course = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: { levels: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!course) return null;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      chapterCount: course.chapters.length,
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        tanenbaumChapter: chapter.tanenbaumChapter,
        order: chapter.order,
        levels: chapter.levels.map((level) => ({
          id: level.id,
          title: level.title,
          description: level.description,
          order: level.order,
          xpReward: level.xpReward,
        })),
      })),
    };
  }
}
