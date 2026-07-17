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

## Fase 2 — Capa de base de datos *(completa)*
- [x] `packages/database/prisma/schema.prisma`: `User`, multi-tenancy (`Classroom`/`ClassroomMembership`), `Course`/`Chapter`/`Level`, `Lab`/`LabAttempt`, `Assessment`/`AssessmentAttempt`, gamificación (`XPTransaction`, `DailyQuest`/`DailyQuestProgress`, `Achievement`/`AchievementLog`, `LeaderboardEntry`), analítica (`UserActivityLog`, `TimeSpentPerModule`).
- [x] Índices y cascadas explícitas por relación.
- [x] `prisma validate` + `prisma generate` + build/typecheck/smoke-test locales (sin tocar la DB real).
- [x] Seed transaccional mínimo (curso base + 8 capítulos de Tanenbaum, contenido real de `CLAUDE.md` §6).
- [x] `prisma migrate dev --name init` aplicada contra Supabase; seed ejecutado y verificado con una lectura real.
- [x] Aprobación del usuario para pasar a Fase 3.

## Fase 3 — Paquete compartido y dominio *(completa)*
- [x] `packages/shared/src/network`: `Ipv4Address`, `Ipv6Address`, `SubnetMask`, `Cidr`, `Port`, `MacAddress` — cada uno con Zod schema + funciones puras (conversión, clasificación RFC) fieles al protocolo real.
- [x] `packages/shared/src/constants`: tabla de puertos bien conocidos (IANA).
- [x] `packages/shared/src/enums`: `Role`, `AttemptStatus`, `AssessmentType`, `LeaderboardScope` — independientes de `@prisma/client` a propósito (ver `DECISIONS.md`).
- [x] `packages/shared/src/dto`: DTOs Zod de `User`, `Classroom`, `Course/Chapter/Level`, `Lab`, `Assessment`, gamificación.
- [x] 83 tests Vitest sobre los value objects de red, con vectores de RFC reales (RFC 1918, 1122, 3927, 5771, 3021, 5952) — corridos y en verde.
- [x] Build/typecheck/test validados desde la raíz vía Turborepo.
- [x] Aprobación del usuario para pasar a Fase 4.

## Fase 4 — Backend NestJS (módulo por módulo)
- [x] Setup base de `apps/backend`: NestJS 11 en ESM, validación de env con Zod al bootstrap, `ConfigModule` apuntando al `.env` raíz.
- [x] `Auth` — Clean Architecture (domain/application/infrastructure): verificación JWT (HS256, `SUPABASE_JWT_SECRET`), sincronización de perfil (`upsert` en `public.users`), guard + decorator `@CurrentUser()`, endpoint `GET /auth/me`.
  - [x] 12 tests Vitest sin mocks: crypto real (firma/verificación JWT), integración contra Supabase real (repositorio), e2e HTTP real contra la app completa. Todos verificados limpiando sus datos de prueba (0 usuarios residuales tras la corrida).
  - [ ] Smoke test contra un token *realmente* emitido por Supabase — pendiente de `SUPABASE_JWT_SECRET` real en `.env` (los tests actuales usan un secreto de prueba controlado, no el del proyecto).
- [ ] `User` (perfil, XP, badges, streak).
- [ ] `Course/Gamification` (cursos, capítulos, niveles, quests, leaderboard).
- [ ] `Simulator Engine` (validación server-side de laboratorios).
- [ ] Aprobación del usuario para pasar al módulo `User`.

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
