import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { AwardXpUseCase } from "./application/award-xp.use-case.js";
import { GetUserProfileUseCase } from "./application/get-user-profile.use-case.js";
import { RecordActivityUseCase } from "./application/record-activity.use-case.js";
import { UpdateUserProfileUseCase } from "./application/update-user-profile.use-case.js";
import { USER_REPOSITORY } from "./domain/user.repository.js";
import { PrismaUserRepository } from "./infrastructure/prisma-user.repository.js";
import { UserController } from "./user.controller.js";

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    AwardXpUseCase,
    RecordActivityUseCase,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [USER_REPOSITORY, AwardXpUseCase, RecordActivityUseCase],
})
export class UserModule {}
