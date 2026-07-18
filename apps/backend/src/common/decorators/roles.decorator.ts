import { SetMetadata } from "@nestjs/common";
import type { Role } from "@network-learning-game/shared";

export const ROLES_KEY = "roles";

/** Úsese junto a SupabaseAuthGuard y RolesGuard: @UseGuards(SupabaseAuthGuard, RolesGuard). */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);
