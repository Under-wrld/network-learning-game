import { Inject, Injectable } from "@nestjs/common";
import type { Role } from "@network-learning-game/shared";
import { CLASSROOM_REPOSITORY, type ClassroomRepository } from "../domain/classroom.repository.js";
import type { ClassroomSummary } from "../domain/classroom.js";

@Injectable()
export class ListMyClassroomsUseCase {
  constructor(@Inject(CLASSROOM_REPOSITORY) private readonly classroomRepository: ClassroomRepository) {}

  execute(userId: string, role: Role): Promise<ClassroomSummary[]> {
    return role === "TEACHER"
      ? this.classroomRepository.listTaughtBy(userId)
      : this.classroomRepository.listJoinedBy(userId);
  }
}
