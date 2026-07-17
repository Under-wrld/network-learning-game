import type { Role } from "@network-learning-game/shared";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  totalXp: number;
  currentStreak: number;
}
