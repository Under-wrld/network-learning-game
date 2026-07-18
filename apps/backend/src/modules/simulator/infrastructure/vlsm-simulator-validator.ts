import { BadRequestException, Injectable } from "@nestjs/common";
import { VlsmAnswerSchema, VlsmExerciseSchema, validateVlsmAllocation } from "@network-learning-game/simulations";
import { ZodError } from "zod";
import type { SimulatorValidationOutcome, SimulatorValidator } from "../domain/simulator-validator.js";

@Injectable()
export class VlsmSimulatorValidator implements SimulatorValidator {
  readonly simulatorKey = "vlsm";

  validate(initialState: unknown, submittedState: unknown): SimulatorValidationOutcome {
    try {
      const exercise = VlsmExerciseSchema.parse(initialState);
      const answer = VlsmAnswerSchema.parse(submittedState);
      const result = validateVlsmAllocation(exercise, answer);
      return { correct: result.correct, score: result.score, errors: result.errors };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(
          error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        );
      }
      throw error;
    }
  }
}
