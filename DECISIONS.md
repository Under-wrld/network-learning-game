# DECISIONS.md

Registro de decisiones arquitectónicas (ADR ligero). Cada entrada: fecha, decisión, alternativas consideradas, motivo.

## 2026-07-17 — Naming de `apps/*` y `packages/*`

**Decisión**: usar `apps/frontend` + `apps/backend` (no `apps/web` + `apps/api` como decía la versión original de `CLAUDE.md`), y mantener `packages/ui`, `packages/game-engine`, `packages/simulations` como paquetes de primer nivel.

**Alternativas consideradas**: renombrar los directorios existentes en disco para hacer match con la redacción original de `CLAUDE.md` (`apps/web`/`apps/api`).

**Motivo**: el scaffolding ya presente en el repo (directorios vacíos pero ya creados) usaba `frontend`/`backend` y ya incluía `ui`/`game-engine`/`simulations`; se optó por actualizar la documentación para reflejar la estructura real en vez de mover directorios, evitando descartar la intención original del scaffold. `CLAUDE.md` §3 y §7 (Fase 4) se actualizaron en consecuencia.

## 2026-07-17 — Trackear `CLAUDE.md` en git

**Decisión**: remover `CLAUDE.md` de `.gitignore` y commitearlo.

**Motivo**: `CLAUDE.md` §9 declara que el documento "gobierna el comportamiento por defecto en este repo" — para que esa afirmación sea cierta en un clone nuevo o para otro colaborador, el archivo debe estar versionado, no ser local-only.

## 2026-07-17 — Untrack de `.env`

**Decisión**: remover `.env` del índice de git (`git rm --cached .env`), manteniéndolo en `.gitignore` y en el filesystem local.

**Motivo**: `.env` estaba trackeado desde el commit inicial pese a estar listado en `.gitignore` (el ignore no aplica retroactivamente a archivos ya trackeados). Estaba vacío al momento de detectarlo, pero se corrigió antes de que el usuario cargara credenciales reales de Supabase, para evitar que terminaran en el historial de git.

## 2026-07-17 — Supabase como proveedor de Postgres + Auth

**Decisión**: usar Supabase (Postgres gestionado + Supabase Auth) en vez de un Postgres autohospedado con Auth.js, para el proyecto en curso.

**Alternativas consideradas**: `CLAUDE.md` §4 módulo 10 dejaba abierta la opción "Auth.js o Supabase Auth".

**Motivo**: el usuario ya cuenta con cuenta y proyecto Supabase provisionados. `DATABASE_URL`/`DIRECT_URL` en `.env.example` se documentaron para el patrón de conexión de Supabase (pooler pgbouncer en runtime, conexión directa para migraciones).
