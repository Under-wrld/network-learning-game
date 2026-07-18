import { randomBytes } from "node:crypto";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@network-learning-game/database";
import type { ClassroomSummary } from "../domain/classroom.js";
import type { ClassroomRepository } from "../domain/classroom.repository.js";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos (0/O, 1/I/L)

function generateJoinCode(length = 6): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length]).join("");
}

@Injectable()
export class PrismaClassroomRepository implements ClassroomRepository {
  async create(teacherId: string, name: string): Promise<ClassroomSummary> {
    // Reintenta en el caso (muy improbable) de colisión de joinCode único.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const classroom = await prisma.classroom.create({
          data: { teacherId, name, joinCode: generateJoinCode() },
        });
        return { id: classroom.id, name: classroom.name, joinCode: classroom.joinCode, teacherId, memberCount: 0 };
      } catch (error) {
        const isUniqueViolation = (error as { code?: string }).code === "P2002";
        if (!isUniqueViolation || attempt === 4) throw error;
      }
    }
    throw new Error("No se pudo generar un joinCode único");
  }

  async joinByCode(userId: string, joinCode: string): Promise<ClassroomSummary> {
    const classroom = await prisma.classroom.findUnique({
      where: { joinCode },
      include: { _count: { select: { members: true } } },
    });
    if (!classroom) {
      throw new NotFoundException("Código de aula inválido");
    }

    const alreadyMember = await prisma.classroomMembership.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId } },
    });
    if (alreadyMember) {
      throw new ConflictException("Ya sos miembro de esta aula");
    }

    await prisma.classroomMembership.create({ data: { classroomId: classroom.id, userId } });

    return {
      id: classroom.id,
      name: classroom.name,
      joinCode: classroom.joinCode,
      teacherId: classroom.teacherId,
      memberCount: classroom._count.members + 1,
    };
  }

  async listTaughtBy(teacherId: string): Promise<ClassroomSummary[]> {
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
    return classrooms.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      joinCode: classroom.joinCode,
      teacherId: classroom.teacherId,
      memberCount: classroom._count.members,
    }));
  }

  async listJoinedBy(userId: string): Promise<ClassroomSummary[]> {
    const memberships = await prisma.classroomMembership.findMany({
      where: { userId },
      include: { classroom: { include: { _count: { select: { members: true } } } } },
      orderBy: { joinedAt: "desc" },
    });
    return memberships.map(({ classroom }) => ({
      id: classroom.id,
      name: classroom.name,
      joinCode: classroom.joinCode,
      teacherId: classroom.teacherId,
      memberCount: classroom._count.members,
    }));
  }
}
