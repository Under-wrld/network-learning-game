import type { AuthenticatedUser } from "./authenticated-user.js";

export interface UpsertAuthUserInput {
  id: string;
  email: string;
}

/**
 * Puerto de persistencia del módulo Auth. Solo cubre lo que Auth necesita
 * (buscar/sincronizar el perfil mínimo); el módulo User (siguiente en la
 * Fase 4) puede extender o reemplazar esta pieza al construirse — evaluar
 * en ese momento y documentar en DECISIONS.md si cambia.
 */
export interface AuthUserRepository {
  findById(id: string): Promise<AuthenticatedUser | null>;
  upsertFromClaims(input: UpsertAuthUserInput): Promise<AuthenticatedUser>;
}

export const AUTH_USER_REPOSITORY = Symbol("AUTH_USER_REPOSITORY");
