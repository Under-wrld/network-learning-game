import { z } from "zod";
import { CidrSchema } from "@network-learning-game/shared";

export const VlsmRequirementSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  hostsNeeded: z.number().int().min(1),
});
export type VlsmRequirement = z.infer<typeof VlsmRequirementSchema>;

export const VlsmExerciseSchema = z.object({
  baseNetwork: CidrSchema,
  requirements: z.array(VlsmRequirementSchema).min(1),
});
export type VlsmExercise = z.infer<typeof VlsmExerciseSchema>;

export const VlsmAllocationSchema = z.object({
  requirementId: z.string().min(1),
  cidr: z.string().min(1),
});
export type VlsmAllocation = z.infer<typeof VlsmAllocationSchema>;

export const VlsmAnswerSchema = z.array(VlsmAllocationSchema);
export type VlsmAnswer = z.infer<typeof VlsmAnswerSchema>;

export interface VlsmValidationError {
  requirementId?: string;
  code:
    | "MISSING"
    | "UNKNOWN_REQUIREMENT"
    | "DUPLICATE"
    | "INVALID_CIDR"
    | "NOT_NETWORK_ADDRESS"
    | "OUTSIDE_BASE_NETWORK"
    | "INSUFFICIENT_HOSTS"
    | "OVERLAP";
  message: string;
}

export interface VlsmValidationResult {
  correct: boolean;
  score: number;
  errors: VlsmValidationError[];
}
