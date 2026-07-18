import type { UserProfile } from "./user-profile.js";

export interface UpdateProfilePatch {
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Opera sobre usuarios ya existentes en public.users — la creación de la
 * fila es responsabilidad exclusiva del módulo Auth (upsert al primer
 * login). Todo endpoint que use este puerto vive detrás de SupabaseAuthGuard,
 * así que para cuando se llega acá el usuario ya fue sincronizado.
 */
export interface UserRepository {
  findById(id: string): Promise<UserProfile | null>;
  updateProfile(id: string, patch: UpdateProfilePatch): Promise<UserProfile>;
  awardXp(input: { userId: string; amount: number; reason: string; sourceType: string; sourceId?: string }): Promise<UserProfile>;
  recordActivity(id: string, now: Date): Promise<UserProfile>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
