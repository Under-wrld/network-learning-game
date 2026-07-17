import { z } from "zod";
import { RoleSchema } from "../enums/domain-enums.js";
import { IdSchema } from "./common.dto.js";

export const UserProfileSchema = z.object({
  id: IdSchema,
  email: z.email(),
  displayName: z.string().min(1).max(80).nullable(),
  avatarUrl: z.url().nullable(),
  role: RoleSchema,
  totalXp: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastActivityAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  avatarUrl: z.url().optional(),
});
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
