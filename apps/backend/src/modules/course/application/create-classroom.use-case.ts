import { Inject, Injectable } from "@nestjs/common";
import { CLASSROOM_REPOSITORY, type ClassroomRepository } from "../domain/classroom.repository.js";
import type { ClassroomSummary } from "../domain/classroom.js";

@Injectable()
export class CreateClassroomUseCase {
  constructor(@Inject(CLASSROOM_REPOSITORY) private readonly classroomRepository: ClassroomRepository) {}

  execute(teacherId: string, name: string): Promise<ClassroomSummary> {
    return this.classroomRepository.create(teacherId, name);
  }
}
