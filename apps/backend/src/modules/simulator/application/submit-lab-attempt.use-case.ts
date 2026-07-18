import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AwardXpUseCase } from "../../user/application/award-xp.use-case.js";
import { RecordActivityUseCase } from "../../user/application/record-activity.use-case.js";
import type { LabAttemptResult } from "../domain/lab-attempt.js";
import { LAB_ATTEMPT_REPOSITORY, type LabAttemptRepository } from "../domain/lab-attempt.repository.js";
import { LAB_REPOSITORY, type LabRepository } from "../domain/lab.repository.js";
import { SIMULATOR_VALIDATORS, type SimulatorValidator } from "../domain/simulator-validator.js";

/**
 * Orquesta la validación server-side autoritativa de un intento de
 * laboratorio (ARCHITECTURE.md §4): resuelve el motor determinista por
 * simulatorKey, persiste el intento, y si es la primera vez que el usuario
 * aprueba este lab, otorga XP y registra actividad de racha.
 */
@Injectable()
export class SubmitLabAttemptUseCase {
  constructor(
    @Inject(LAB_REPOSITORY) private readonly labRepository: LabRepository,
    @Inject(LAB_ATTEMPT_REPOSITORY) private readonly labAttemptRepository: LabAttemptRepository,
    @Inject(SIMULATOR_VALIDATORS) private readonly validators: SimulatorValidator[],
    private readonly awardXp: AwardXpUseCase,
    private readonly recordActivity: RecordActivityUseCase,
  ) {}

  async execute(userId: string, labId: string, submittedState: unknown): Promise<LabAttemptResult> {
    const lab = await this.labRepository.findById(labId);
    if (!lab) {
      throw new NotFoundException(`Lab no encontrado: ${labId}`);
    }

    const validator = this.validators.find((v) => v.simulatorKey === lab.simulatorKey);
    if (!validator) {
      throw new Error(`No hay validador registrado para simulatorKey="${lab.simulatorKey}"`);
    }

    const outcome = validator.validate(lab.initialState, submittedState);
    const status = outcome.correct ? "PASSED" : "FAILED";

    let xpAwarded = 0;
    if (outcome.correct && !(await this.labAttemptRepository.hasPassedAttempt(userId, labId))) {
      xpAwarded = lab.maxXp;
    }

    const attempt = await this.labAttemptRepository.create({
      labId,
      userId,
      state: submittedState as Record<string, unknown>,
      status,
      score: outcome.score,
      xpAwarded,
    });

    if (xpAwarded > 0) {
      await this.awardXp.execute({
        userId,
        amount: xpAwarded,
        reason: `Laboratorio completado: ${lab.title}`,
        sourceType: "LAB_COMPLETION",
        sourceId: labId,
      });
    }

    if (outcome.correct) {
      await this.recordActivity.execute(userId);
    }

    return {
      id: attempt.id,
      labId,
      status,
      score: outcome.score,
      xpAwarded,
      submittedAt: attempt.submittedAt,
      errors: outcome.errors,
    };
  }
}
