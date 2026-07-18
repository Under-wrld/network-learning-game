import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/infrastructure/current-user.decorator.js";
import { SupabaseAuthGuard } from "../auth/infrastructure/supabase-auth.guard.js";
import type { AuthenticatedUser } from "../auth/domain/authenticated-user.js";
import { GetLabUseCase } from "./application/get-lab.use-case.js";
import { SubmitLabAttemptUseCase } from "./application/submit-lab-attempt.use-case.js";
import type { LabAttemptResult } from "./domain/lab-attempt.js";
import type { Lab } from "./domain/lab.js";

@Controller("labs")
export class SimulatorController {
  constructor(
    private readonly getLab: GetLabUseCase,
    private readonly submitLabAttempt: SubmitLabAttemptUseCase,
  ) {}

  @Get(":id")
  get(@Param("id") id: string): Promise<Lab> {
    return this.getLab.execute(id);
  }

  @Post(":id/attempts")
  @UseGuards(SupabaseAuthGuard)
  submit(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ): Promise<LabAttemptResult> {
    return this.submitLabAttempt.execute(user.id, id, body);
  }
}
