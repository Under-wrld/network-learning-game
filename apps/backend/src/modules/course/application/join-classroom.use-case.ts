import { Inject, Injectable } from "@nestjs/common";
import { CLASSROOM_REPOSITORY, type ClassroomRepository } from "../domain/classroom.repository.js";
import type { ClassroomSummary } from "../domain/classroom.js";

@Injectable()
export class JoinClassroomUseCase {
  constructor(@Inject(CLASSROOM_REPOSITORY) private readonly classroomRepository: ClassroomRepository) {}

  execute(userId: string, joinCode: string): Promise<ClassroomSummary> {
    return this.classroomRepository.joinByCode(userId, joinCode);
  }
}
