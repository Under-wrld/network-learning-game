# ROADMAP.md

Roadmap iterativo del MVP, organizado según el protocolo "Stop & Ask" de [CLAUDE.md](CLAUDE.md) §7. Cada fase se marca `[x]` solo cuando está completa, testeada y aprobada por el usuario.

## Fase 0 — Sincronización y descubrimiento
- [x] Auditoría del estado real del repo vs. blueprint de `CLAUDE.md`.
- [x] Reconciliación de naming (`apps/frontend` + `apps/backend`, `packages/ui|game-engine|simulations`).
- [x] `CLAUDE.md` trackeado en git.

## Fase 1 — Inicialización PRD y Monorepo *(completa)*
- [x] `package.json` raíz (`private`, scripts, `turbo` como devDependency).
- [x] `turbo.json` (pipeline build/dev/lint/test/typecheck/format).
- [x] `tsconfig.json` raíz.
- [x] `.env.example` / `.env` con variables de Supabase + Prisma (sin secretos).
- [x] CI alineado a la versión de pnpm pineada en el repo.
- [x] `docs/PRD.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, `CONTRIBUTING.md`.
- [x] `pnpm install` + validación de `turbo.json` (dry-run).
- [x] Aprobación del usuario para pasar a Fase 2.

## Fase 2 — Capa de base de datos *(en curso)*
- [x] `packages/database/prisma/schema.prisma`: `User`, multi-tenancy (`Classroom`/`ClassroomMembership`), `Course`/`Chapter`/`Level`, `Lab`/`LabAttempt`, `Assessment`/`AssessmentAttempt`, gamificación (`XPTransaction`, `DailyQuest`/`DailyQuestProgress`, `Achievement`/`AchievementLog`, `LeaderboardEntry`), analítica (`UserActivityLog`, `TimeSpentPerModule`).
- [x] Índices y cascadas explícitas por relación.
- [x] `prisma validate` + `prisma generate` + build/typecheck/smoke-test locales (sin tocar la DB real).
- [x] Seed transaccional mínimo (curso base + 8 capítulos de Tanenbaum, contenido real de `CLAUDE.md` §6).
- [ ] `prisma migrate dev` inicial contra Supabase (pendiente de aprobación — acción sobre infraestructura real).

## Fase 3 — Paquete compartido y dominio
- [ ] `packages/shared`: value objects de networking (`IPAddress`, `SubnetMask`, `Port`, `MacAddress`, `CIDR`) con validación Zod fiel al protocolo real.
- [ ] DTOs de request/response compartidos entre frontend y backend.

## Fase 4 — Backend NestJS (módulo por módulo)
- [ ] `Auth` (Supabase Auth guard + sincronización de rol).
- [ ] `User` (perfil, XP, badges, streak).
- [ ] `Course/Gamification` (cursos, capítulos, niveles, quests, leaderboard).
- [ ] `Simulator Engine` (validación server-side de laboratorios).
- [ ] Tests unitarios Vitest por servicio (`pnpm --filter backend test`).

## Fase 5 — Frontend Next.js y motor de simuladores
- [ ] Layouts, providers, Zustand store base.
- [ ] Integración shadcn/ui + Tailwind (tema Linear/Duolingo/Notion).
- [ ] Primer simulador interactivo funcional end-to-end (candidato: subnetting/VLSM, Capa de Red).

## Fase 6 — QA, E2E y despliegue en contenedores
- [ ] Playwright E2E sobre el loop de validación de laboratorios.
- [ ] Dockerfiles + `docker-compose` de producción (App, API, DB, Cache).
- [ ] Matriz de despliegue de un solo comando.

## Backlog post-MVP
- Tutor IA (orquestación real sobre el contrato definido en Fase 4).
- Economía de cosméticos avanzada.
- Internacionalización completa de contenido (Next-Intl ya arquitectado).
- Cobertura de los 8 capítulos de Tanenbaum con simuladores de profundidad equivalente.
