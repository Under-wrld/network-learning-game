import { z } from "zod";
import { LeaderboardScopeSchema } from "../enums/domain-enums.js";
import { IdSchema } from "./common.dto.js";

export const XpTransactionSchema = z.object({
  id: IdSchema,
  amount: z.number().int(),
  reason: z.string().min(1),
  sourceType: z.string().min(1),
  sourceId: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type XpTransaction = z.infer<typeof XpTransactionSchema>;

export const AchievementSchema = z.object({
  id: IdSchema,
  key: z.string().min(1),
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  iconUrl: z.url().nullable(),
  xpReward: z.number().int().min(0),
});
export type Achievement = z.infer<typeof AchievementSchema>;

export const DailyQuestSchema = z.object({
  id: IdSchema,
  title: z.string().min(1).max(160),
  description: z.string().min(1),
  xpReward: z.number().int().min(0),
  activeDate: z.iso.date(),
});
export type DailyQuest = z.infer<typeof DailyQuestSchema>;

export const LeaderboardEntrySchema = z.object({
  scope: LeaderboardScopeSchema,
  classroomId: IdSchema.nullable(),
  userId: IdSchema,
  displayName: z.string().nullable(),
  xp: z.number().int().min(0),
  rank: z.number().int().min(1),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
