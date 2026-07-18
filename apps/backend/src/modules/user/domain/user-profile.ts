import type { Role } from "@network-learning-game/shared";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: Role;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date | null;
  createdAt: Date;
}
