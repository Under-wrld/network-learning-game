import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { LAB_REPOSITORY, type LabRepository } from "../domain/lab.repository.js";
import type { Lab } from "../domain/lab.js";

@Injectable()
export class GetLabUseCase {
  constructor(@Inject(LAB_REPOSITORY) private readonly labRepository: LabRepository) {}

  async execute(id: string): Promise<Lab> {
    const lab = await this.labRepository.findById(id);
    if (!lab) {
      throw new NotFoundException(`Lab no encontrado: ${id}`);
    }
    return lab;
  }
}
