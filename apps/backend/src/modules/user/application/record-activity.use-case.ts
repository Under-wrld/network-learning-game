import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository.js";
import type { UserProfile } from "../domain/user-profile.js";

/** Actualiza la racha diaria — llamado tras cualquier actividad que deba contar (lab/quiz completado, quest, etc). */
@Injectable()
export class RecordActivityUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: string, now: Date = new Date()): Promise<UserProfile> {
    return this.userRepository.recordActivity(userId, now);
  }
}
