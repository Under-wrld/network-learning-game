import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CreateClassroomUseCase } from "./application/create-classroom.use-case.js";
import { EnrollInCourseUseCase } from "./application/enroll-in-course.use-case.js";
import { GetCourseDetailUseCase } from "./application/get-course-detail.use-case.js";
import { GetLeaderboardUseCase } from "./application/get-leaderboard.use-case.js";
import { JoinClassroomUseCase } from "./application/join-classroom.use-case.js";
import { ListCoursesUseCase } from "./application/list-courses.use-case.js";
import { ListMyClassroomsUseCase } from "./application/list-my-classrooms.use-case.js";
import { ClassroomController } from "./classroom.controller.js";
import { CLASSROOM_REPOSITORY } from "./domain/classroom.repository.js";
import { COURSE_REPOSITORY } from "./domain/course.repository.js";
import { ENROLLMENT_REPOSITORY } from "./domain/enrollment.repository.js";
import { LEADERBOARD_REPOSITORY } from "./domain/leaderboard.repository.js";
import { CourseController } from "./course.controller.js";
import { PrismaClassroomRepository } from "./infrastructure/prisma-classroom.repository.js";
import { PrismaCourseRepository } from "./infrastructure/prisma-course.repository.js";
import { PrismaEnrollmentRepository } from "./infrastructure/prisma-enrollment.repository.js";
import { PrismaLeaderboardRepository } from "./infrastructure/prisma-leaderboard.repository.js";
import { LeaderboardController } from "./leaderboard.controller.js";

@Module({
  imports: [AuthModule],
  controllers: [CourseController, LeaderboardController, ClassroomController],
  providers: [
    ListCoursesUseCase,
    GetCourseDetailUseCase,
    EnrollInCourseUseCase,
    GetLeaderboardUseCase,
    CreateClassroomUseCase,
    JoinClassroomUseCase,
    ListMyClassroomsUseCase,
    { provide: COURSE_REPOSITORY, useClass: PrismaCourseRepository },
    { provide: ENROLLMENT_REPOSITORY, useClass: PrismaEnrollmentRepository },
    { provide: LEADERBOARD_REPOSITORY, useClass: PrismaLeaderboardRepository },
    { provide: CLASSROOM_REPOSITORY, useClass: PrismaClassroomRepository },
  ],
})
export class CourseModule {}
