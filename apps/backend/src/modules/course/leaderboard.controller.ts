import { Controller, Get, Param, Query } from "@nestjs/common";
import { GetLeaderboardUseCase } from "./application/get-leaderboard.use-case.js";
import type { LeaderboardRow } from "./domain/leaderboard.repository.js";

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly getLeaderboard: GetLeaderboardUseCase) {}

  @Get("global")
  global(@Query("limit") limit?: string): Promise<LeaderboardRow[]> {
    return this.getLeaderboard.executeGlobal(limit ? Number(limit) : undefined);
  }

  @Get("classroom/:classroomId")
  classroom(@Param("classroomId") classroomId: string, @Query("limit") limit?: string): Promise<LeaderboardRow[]> {
    return this.getLeaderboard.executeClassroom(classroomId, limit ? Number(limit) : undefined);
  }
}
