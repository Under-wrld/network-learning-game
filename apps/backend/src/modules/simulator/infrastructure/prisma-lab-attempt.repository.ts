import { Injectable } from "@nestjs/common";
import { prisma, type Prisma } from "@network-learning-game/database";
import type { CreateLabAttemptInput, LabAttemptRepository } from "../domain/lab-attempt.repository.js";

@Injectable()
export class PrismaLabAttemptRepository implements LabAttemptRepository {
  async create(input: CreateLabAttemptInput): Promise<{ id: string; submittedAt: Date }> {
    const submittedAt = new Date();
    const attempt = await prisma.labAttempt.create({
      data: {
        labId: input.labId,
        userId: input.userId,
        // Record<string, unknown> es, en runtime, siempre JSON serializable
        // acá (viene de un submittedState ya validado por Zod contra el
        // schema del simulador correspondiente); TS no puede verificar eso
        // estáticamente para un Record<string, unknown> genérico.
        state: input.state as unknown as Prisma.InputJsonValue,
        status: input.status,
        score: input.score,
        xpAwarded: input.xpAwarded,
        submittedAt,
      },
    });
    return { id: attempt.id, submittedAt: attempt.submittedAt ?? submittedAt };
  }

  async hasPassedAttempt(userId: string, labId: string): Promise<boolean> {
    const count = await prisma.labAttempt.count({ where: { userId, labId, status: "PASSED" } });
    return count > 0;
  }
}
