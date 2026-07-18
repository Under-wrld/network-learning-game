import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { COURSE_REPOSITORY, type CourseRepository } from "../domain/course.repository.js";
import { ENROLLMENT_REPOSITORY, type Enrollment, type EnrollmentRepository } from "../domain/enrollment.repository.js";

@Injectable()
export class EnrollInCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY) private readonly courseRepository: CourseRepository,
    @Inject(ENROLLMENT_REPOSITORY) private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(userId: string, courseSlug: string): Promise<Enrollment> {
    const course = await this.courseRepository.findBySlug(courseSlug);
    if (!course) {
      throw new NotFoundException(`Curso no encontrado: ${courseSlug}`);
    }

    if (await this.enrollmentRepository.isEnrolled(userId, course.id)) {
      throw new ConflictException("Ya estás inscrito en este curso");
    }

    return this.enrollmentRepository.enroll(userId, course.id);
  }
}
