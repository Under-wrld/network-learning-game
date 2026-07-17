import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthenticateRequestUseCase } from "../application/authenticate-request.use-case.js";
import type { AuthenticatedUser } from "../domain/authenticated-user.js";

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

const BEARER_PREFIX = "Bearer ";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authenticateRequest: AuthenticateRequestUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException("Falta el header Authorization: Bearer <token>");
    }

    const token = authHeader.slice(BEARER_PREFIX.length);
    request.user = await this.authenticateRequest.execute(token);
    return true;
  }
}
