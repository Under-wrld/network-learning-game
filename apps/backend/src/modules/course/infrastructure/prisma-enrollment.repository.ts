import { Injectable } from "@nestjs/common";
import { prisma } from "@network-learning-game/database";
import type { Enrollment, EnrollmentRepository } from "../domain/enrollment.repository.js";

@Injectable()
export class PrismaEnrollmentRepository implements EnrollmentRepository {
  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await prisma.courseEnrollment.create({
      data: { userId, courseId },
    });
    return { id: enrollment.id, userId: enrollment.userId, courseId: enrollment.courseId, enrolledAt: enrollment.enrolledAt };
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const count = await prisma.courseEnrollment.count({ where: { userId, courseId } });
    return count > 0;
  }
}
