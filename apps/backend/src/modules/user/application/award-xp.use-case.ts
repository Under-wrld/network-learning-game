import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository.js";
import type { UserProfile } from "../domain/user-profile.js";

export interface AwardXpInput {
  userId: string;
  amount: number;
  reason: string;
  sourceType: string;
  sourceId?: string;
}

/**
 * Punto único de otorgamiento de XP — otros módulos (Simulator Engine,
 * Gamification) llaman esto en vez de escribir en XPTransaction/User
 * directamente, para que el registro de auditoría sea siempre consistente.
 */
@Injectable()
export class AwardXpUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(input: AwardXpInput): Promise<UserProfile> {
    if (!Number.isInteger(input.amount) || input.amount === 0) {
      throw new Error(`Monto de XP inválido: ${input.amount}`);
    }
    return this.userRepository.awardXp(input);
  }
}
