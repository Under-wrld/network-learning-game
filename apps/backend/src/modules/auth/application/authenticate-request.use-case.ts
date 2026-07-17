import { Inject, Injectable } from "@nestjs/common";
import { AUTH_USER_REPOSITORY, type AuthUserRepository } from "../domain/auth-user.repository.js";
import type { AuthenticatedUser } from "../domain/authenticated-user.js";
import { TOKEN_VERIFIER, type TokenVerifier } from "../domain/token-verifier.js";

/**
 * Verifica el access token de Supabase y sincroniza (upsert) el perfil local
 * — el punto único donde una identidad de Supabase Auth se materializa como
 * fila de public.users (ver ARCHITECTURE.md §6).
 */
@Injectable()
export class AuthenticateRequestUseCase {
  constructor(
    @Inject(TOKEN_VERIFIER) private readonly tokenVerifier: TokenVerifier,
    @Inject(AUTH_USER_REPOSITORY) private readonly authUserRepository: AuthUserRepository,
  ) {}

  async execute(bearerToken: string): Promise<AuthenticatedUser> {
    const claims = this.tokenVerifier.verify(bearerToken);
    return this.authUserRepository.upsertFromClaims({ id: claims.sub, email: claims.email });
  }
}
