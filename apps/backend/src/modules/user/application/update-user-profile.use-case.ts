import { Inject, Injectable } from "@nestjs/common";
import type { UpdateUserProfile } from "@network-learning-game/shared";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository.js";
import type { UserProfile } from "../domain/user-profile.js";

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: string, patch: UpdateUserProfile): Promise<UserProfile> {
    return this.userRepository.updateProfile(userId, patch);
  }
}
