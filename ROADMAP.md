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

## Fase 4 — Backend NestJS (módulo por módulo) *(completa)*
- [x] Setup base de `apps/backend`: NestJS 11 en ESM, validación de env con Zod al bootstrap, `ConfigModule` apuntando al `.env` raíz.
- [x] `Auth` — verificación JWT (HS256, `SUPABASE_JWT_SECRET`), sincronización de identidad (`upsert` en `public.users`), guard + decorator `@CurrentUser()`, endpoint `GET /auth/me`.
- [x] `User` — perfil, motor XP/nivel (`XP = 100 × nivel^1.5`), racha diaria, `GET/PATCH /users/me`.
- [x] `Course/Gamification` — catálogo de cursos, inscripción, aulas (`Classroom`, crear/unirse por `joinCode`, RBAC de rol vía `RolesGuard`), leaderboard global/por aula.
- [x] `packages/simulations` — motor VLSM/subnetting determinista y puro (`validateVlsmAllocation`), compartible entre frontend y backend.
- [x] `Simulator Engine` — `GET /labs/:id`, `POST /labs/:id/attempts`: valida contra el motor VLSM, otorga XP solo en el primer PASSED, actualiza racha.
- [x] Contenido real sembrado: laboratorio VLSM completo bajo Capítulo 5 (Capa de Red) → Nivel "Subnetting con VLSM".
- [x] 146 tests en verde en todo el monorepo (83 shared + 11 simulations + 52 backend), sin mocks: crypto real, DB real (Supabase), e2e HTTP real. Un test e2e detectó y permitió corregir un bug real de cross-módulo (ver `DECISIONS.md`).
- [x] Smoke test contra un token *realmente* emitido por Supabase — reveló que el proyecto firma con ES256/JWKS, no HS256 (bug real corregido; ver `DECISIONS.md`). Los 5 specs e2e de Auth/User/Course/Simulator ahora crean usuarios reales vía Admin API y usan tokens genuinamente emitidos.
- [x] Aprobación del usuario para continuar sin gate por módulo (instrucción explícita: completar fases restantes de corrido).

## Fase 5 — Frontend Next.js y motor de simuladores *(completa)*
- [x] Next.js 16 (App Router, Turbopack) + TailwindCSS v4 + shadcn/ui (preset `base-nova`, Base UI) — tema propio (índigo + tokens semánticos `xp`/`streak`/`success`, look Linear/Notion con acentos estilo Duolingo).
- [x] Cliente Supabase (`@supabase/ssr`) para browser/server/proxy, con refresco de sesión y protección de rutas.
- [x] Auth: login/registro (email+password) + botón de login social Google, validados con React Hook Form + Zod.
- [x] Zustand: store de sesión de laboratorio en curso (`useLabSessionStore`), por diseño (ARCHITECTURE.md §3).
- [x] Dashboard de estudiante (XP, nivel derivado, barra de progreso, racha).
- [x] Catálogo de cursos, detalle con capítulos/niveles, inscripción.
- [x] Aulas: crear (TEACHER)/unirse (STUDENT) por `joinCode`.
- [x] Leaderboard global.
- [x] UI del simulador VLSM con validación en vivo (misma función pura de `packages/simulations` que corre en el backend) + envío autoritativo a `POST /labs/:id/attempts`.
- [x] Build/typecheck en verde en los 6 paquetes del monorepo vía Turborepo; smoke test real con el dev server (rutas públicas 200, `/dashboard` sin sesión redirige a `/login?redirectTo=...`).
- [x] Smoke test completo en navegador con el backend real (signup → dashboard → lab) — corrido vía el E2E de Playwright (Fase 6), login real de punta a punta.

## Fase 6 — QA, E2E y despliegue en contenedores *(en curso)*
- [x] Playwright configurado (`apps/e2e`), con auto-arranque de backend+frontend vía `webServer`. Golden path completo escrito: login → dashboard → catálogo → inscripción → laboratorio VLSM → XP, más un caso de asignación incorrecta. Usa la Admin API de Supabase para crear un usuario ya confirmado (evita depender de email real).
- [x] `apps/backend/src/health` — endpoint `GET /health`, usado por Docker healthchecks y por Playwright para esperar a que el server esté listo.
- [x] Dockerfiles multi-stage para `backend` (`pnpm deploy --prod`, imagen `node:24-alpine`) y `frontend` (Next.js `output: "standalone"`) — **construidos y corridos de verdad** con `docker build`/`docker run`, no solo escritos: el backend levantó todas las rutas y respondió `/health`; el frontend sirvió `/` y `/login` con `curl`.
- [x] `docker/docker-compose.yml` (backend + frontend + Redis; sin Postgres — Supabase gestionado, ver `DECISIONS.md`) — validado con `docker compose build` real.
- [x] `.github/workflows/ci-cd.yml` reescrito: typecheck/lint/test/build reales contra secrets de GitHub Actions (a configurar por el usuario) + job separado de validación de builds Docker.
- [x] `pnpm test` y `pnpm test:e2e` separados como tasks de Turborepo distintos — evita que un fallo en E2E mate procesos de Vitest a mitad de corrida (nos dejó 5 usuarios de prueba sin limpiar una vez; ver `DECISIONS.md`).
- [x] `pnpm test:e2e` corrido de verdad: golden path completo en verde (login real → dashboard → inscripción → laboratorio VLSM → XP), más el caso de asignación incorrecta. En el camino se corrigieron 3 bugs reales expuestos únicamente por el E2E real: verificación JWT ES256/JWKS, una carrera de concurrencia en el upsert de usuario nuevo, y locators de Playwright ambiguos (ver `DECISIONS.md`).
- [ ] Deploy real a Vercel (frontend) y Railway (backend).
- [x] Push a `origin/main`.

## Backlog post-MVP
- Tutor IA (orquestación real sobre el contrato definido en Fase 4).
- Economía de cosméticos avanzada.
- Internacionalización completa de contenido (Next-Intl ya arquitectado).
- Cobertura de los 8 capítulos de Tanenbaum con simuladores de profundidad equivalente.
