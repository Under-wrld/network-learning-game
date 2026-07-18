import type { Lab } from "./lab.js";

export interface LabRepository {
  findById(id: string): Promise<Lab | null>;
}

export const LAB_REPOSITORY = Symbol("LAB_REPOSITORY");
