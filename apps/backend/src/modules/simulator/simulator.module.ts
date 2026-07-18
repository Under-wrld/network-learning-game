import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { UserModule } from "../user/user.module.js";
import { GetLabUseCase } from "./application/get-lab.use-case.js";
import { SubmitLabAttemptUseCase } from "./application/submit-lab-attempt.use-case.js";
import { LAB_ATTEMPT_REPOSITORY } from "./domain/lab-attempt.repository.js";
import { LAB_REPOSITORY } from "./domain/lab.repository.js";
import { SIMULATOR_VALIDATORS } from "./domain/simulator-validator.js";
import { PrismaLabAttemptRepository } from "./infrastructure/prisma-lab-attempt.repository.js";
import { PrismaLabRepository } from "./infrastructure/prisma-lab.repository.js";
import { VlsmSimulatorValidator } from "./infrastructure/vlsm-simulator-validator.js";
import { SimulatorController } from "./simulator.controller.js";

@Module({
  imports: [AuthModule, UserModule],
  controllers: [SimulatorController],
  providers: [
    GetLabUseCase,
    SubmitLabAttemptUseCase,
    VlsmSimulatorValidator,
    { provide: LAB_REPOSITORY, useClass: PrismaLabRepository },
    { provide: LAB_ATTEMPT_REPOSITORY, useClass: PrismaLabAttemptRepository },
    {
      provide: SIMULATOR_VALIDATORS,
      useFactory: (vlsm: VlsmSimulatorValidator) => [vlsm],
      inject: [VlsmSimulatorValidator],
    },
  ],
})
export class SimulatorModule {}
