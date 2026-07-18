import { Inject, Injectable } from "@nestjs/common";
import { COURSE_REPOSITORY, type CourseRepository } from "../domain/course.repository.js";
import type { CourseSummary } from "../domain/course.js";

@Injectable()
export class ListCoursesUseCase {
  constructor(@Inject(COURSE_REPOSITORY) private readonly courseRepository: CourseRepository) {}

  execute(): Promise<CourseSummary[]> {
    return this.courseRepository.listPublished();
  }
}
