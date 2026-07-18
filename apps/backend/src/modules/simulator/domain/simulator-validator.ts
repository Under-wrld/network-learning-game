import type { ValidationErrorDetail } from "./lab-attempt.js";

export interface SimulatorValidationOutcome {
  correct: boolean;
  score: number;
  errors: ValidationErrorDetail[];
}

/**
 * Un motor determinista por `simulatorKey` (ver Lab.simulatorKey). Solo
 * "vlsm" está implementado hoy; nuevos simuladores (CSMA/CD, TCP handshake,
 * etc.) se agregan implementando esta interfaz y registrándolos en
 * simulator.module.ts — sin tocar el caso de uso que los orquesta.
 */
export interface SimulatorValidator {
  readonly simulatorKey: string;
  validate(initialState: unknown, submittedState: unknown): SimulatorValidationOutcome;
}

export const SIMULATOR_VALIDATORS = Symbol("SIMULATOR_VALIDATORS");
