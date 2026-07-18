import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository.js";
import type { UserProfile } from "../domain/user-profile.js";

@Injectable()
export class GetUserProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.userRepository.findById(userId);
    if (!profile) {
      throw new NotFoundException(`Perfil no encontrado: ${userId}`);
    }
    return profile;
  }
}
