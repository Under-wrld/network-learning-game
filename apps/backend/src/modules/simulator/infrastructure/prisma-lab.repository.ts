import { Injectable } from "@nestjs/common";
import { prisma } from "@network-learning-game/database";
import type { Lab } from "../domain/lab.js";
import type { LabRepository } from "../domain/lab.repository.js";

@Injectable()
export class PrismaLabRepository implements LabRepository {
  async findById(id: string): Promise<Lab | null> {
    const lab = await prisma.lab.findUnique({ where: { id } });
    if (!lab) return null;

    return {
      id: lab.id,
      levelId: lab.levelId,
      title: lab.title,
      description: lab.description,
      simulatorKey: lab.simulatorKey,
      initialState: lab.initialState as Record<string, unknown>,
      maxXp: lab.maxXp,
    };
  }
}
