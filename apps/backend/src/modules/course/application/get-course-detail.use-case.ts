import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { COURSE_REPOSITORY, type CourseRepository } from "../domain/course.repository.js";
import type { CourseDetail } from "../domain/course.js";

@Injectable()
export class GetCourseDetailUseCase {
  constructor(@Inject(COURSE_REPOSITORY) private readonly courseRepository: CourseRepository) {}

  async execute(slug: string): Promise<CourseDetail> {
    const course = await this.courseRepository.findBySlug(slug);
    if (!course) {
      throw new NotFoundException(`Curso no encontrado: ${slug}`);
    }
    return course;
  }
}
