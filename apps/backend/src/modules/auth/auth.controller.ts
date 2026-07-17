import { Controller, Get, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "./domain/authenticated-user.js";
import { CurrentUser } from "./infrastructure/current-user.decorator.js";
import { SupabaseAuthGuard } from "./infrastructure/supabase-auth.guard.js";

@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
