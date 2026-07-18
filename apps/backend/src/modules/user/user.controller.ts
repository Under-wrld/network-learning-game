import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { UpdateUserProfileSchema, type UpdateUserProfile } from "@network-learning-game/shared";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { CurrentUser } from "../auth/infrastructure/current-user.decorator.js";
import { SupabaseAuthGuard } from "../auth/infrastructure/supabase-auth.guard.js";
import type { AuthenticatedUser } from "../auth/domain/authenticated-user.js";
import { GetUserProfileUseCase } from "./application/get-user-profile.use-case.js";
import { UpdateUserProfileUseCase } from "./application/update-user-profile.use-case.js";
import type { UserProfile } from "./domain/user-profile.js";

@Controller("users")
@UseGuards(SupabaseAuthGuard)
export class UserController {
  constructor(
    private readonly getUserProfile: GetUserProfileUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
  ) {}

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfile> {
    return this.getUserProfile.execute(user.id);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateUserProfileSchema)) patch: UpdateUserProfile,
  ): Promise<UserProfile> {
    return this.updateUserProfile.execute(user.id, patch);
  }
}
