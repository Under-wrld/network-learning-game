import { Module } from "@nestjs/common";
import { AuthenticateRequestUseCase } from "./application/authenticate-request.use-case.js";
import { AuthController } from "./auth.controller.js";
import { AUTH_USER_REPOSITORY } from "./domain/auth-user.repository.js";
import { TOKEN_VERIFIER } from "./domain/token-verifier.js";
import { JwtTokenVerifier } from "./infrastructure/jwt-token-verifier.js";
import { PrismaAuthUserRepository } from "./infrastructure/prisma-auth-user.repository.js";
import { SupabaseAuthGuard } from "./infrastructure/supabase-auth.guard.js";

@Module({
  controllers: [AuthController],
  providers: [
    AuthenticateRequestUseCase,
    SupabaseAuthGuard,
    { provide: TOKEN_VERIFIER, useClass: JwtTokenVerifier },
    { provide: AUTH_USER_REPOSITORY, useClass: PrismaAuthUserRepository },
  ],
  exports: [AuthenticateRequestUseCase, SupabaseAuthGuard],
})
export class AuthModule {}
