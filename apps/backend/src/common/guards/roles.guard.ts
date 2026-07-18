import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@network-learning-game/shared";
import type { AuthenticatedRequest } from "../../modules/auth/infrastructure/supabase-auth.guard.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";

/** Debe declararse después de SupabaseAuthGuard en @UseGuards: necesita request.user ya poblado. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException(`Requiere rol: ${requiredRoles.join(" o ")}`);
    }
    return true;
  }
}
