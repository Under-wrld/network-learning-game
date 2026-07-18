import { Controller, Get } from "@nestjs/common";

/** Usado por Docker/Railway healthchecks y por Playwright para saber cuándo el server está listo. */
@Controller("health")
export class HealthController {
  @Get()
  check(): { status: "ok" } {
    return { status: "ok" };
  }
}
