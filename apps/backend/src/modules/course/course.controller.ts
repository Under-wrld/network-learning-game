import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/infrastructure/current-user.decorator.js";
import { SupabaseAuthGuard } from "../auth/infrastructure/supabase-auth.guard.js";
import type { AuthenticatedUser } from "../auth/domain/authenticated-user.js";
import { EnrollInCourseUseCase } from "./application/enroll-in-course.use-case.js";
import { GetCourseDetailUseCase } from "./application/get-course-detail.use-case.js";
import { ListCoursesUseCase } from "./application/list-courses.use-case.js";
import type { CourseDetail, CourseSummary } from "./domain/course.js";
import type { Enrollment } from "./domain/enrollment.repository.js";

@Controller("courses")
export class CourseController {
  constructor(
    private readonly listCourses: ListCoursesUseCase,
    private readonly getCourseDetail: GetCourseDetailUseCase,
    private readonly enrollInCourse: EnrollInCourseUseCase,
  ) {}

  @Get()
  list(): Promise<CourseSummary[]> {
    return this.listCourses.execute();
  }

  @Get(":slug")
  detail(@Param("slug") slug: string): Promise<CourseDetail> {
    return this.getCourseDetail.execute(slug);
  }

  @Post(":slug/enroll")
  @UseGuards(SupabaseAuthGuard)
  enroll(@Param("slug") slug: string, @CurrentUser() user: AuthenticatedUser): Promise<Enrollment> {
    return this.enrollInCourse.execute(user.id, slug);
  }
}
