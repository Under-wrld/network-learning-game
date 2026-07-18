import { Inject, Injectable } from "@nestjs/common";
import { LEADERBOARD_REPOSITORY, type LeaderboardRepository, type LeaderboardRow } from "../domain/leaderboard.repository.js";

const DEFAULT_LIMIT = 50;

@Injectable()
export class GetLeaderboardUseCase {
  constructor(@Inject(LEADERBOARD_REPOSITORY) private readonly leaderboardRepository: LeaderboardRepository) {}

  executeGlobal(limit = DEFAULT_LIMIT): Promise<LeaderboardRow[]> {
    return this.leaderboardRepository.getGlobalTop(limit);
  }

  executeClassroom(classroomId: string, limit = DEFAULT_LIMIT): Promise<LeaderboardRow[]> {
    return this.leaderboardRepository.getClassroomTop(classroomId, limit);
  }
}
