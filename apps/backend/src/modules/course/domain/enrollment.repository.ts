export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
}

export interface EnrollmentRepository {
  enroll(userId: string, courseId: string): Promise<Enrollment>;
  isEnrolled(userId: string, courseId: string): Promise<boolean>;
}

export const ENROLLMENT_REPOSITORY = Symbol("ENROLLMENT_REPOSITORY");
