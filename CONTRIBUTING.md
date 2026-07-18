# CONTRIBUTING.md

## Requisitos

- Node.js ≥ 22
- pnpm `11.13.1` (pineado en `package.json` vía `packageManager`; con Corepack activado se resuelve solo)

## Setup local

```bash
pnpm install
cp .env.example .env   # completa tus credenciales de Supabase — nunca las commitees
```

## Comandos de workspace

Todos los comandos raíz delegan en Turborepo, que solo ejecuta el task en los paquetes/apps que lo definan:

```bash
pnpm dev          # levanta apps/frontend y apps/backend en modo watch
pnpm build        # build de todo el monorepo
pnpm lint         # lint de todo el monorepo (ver nota TypeScript 7 abajo)
pnpm typecheck    # chequeo de tipos de todo el monorepo — el gate real de tipos
pnpm test         # tests unitarios/integración (Vitest) de todo el monorepo
pnpm test:e2e     # Playwright E2E (ver abajo) — separado de `test` a propósito
```

Para apuntar a un paquete específico: `pnpm --filter backend test`, `pnpm --filter frontend dev`, etc.

### E2E (Playwright)

`apps/e2e` corre el golden path completo (login → dashboard → curso → laboratorio VLSM) contra el backend y frontend reales, usando la Admin API de Supabase para crear un usuario de prueba ya confirmado (evita depender de un proveedor de email real). Requiere:

```bash
pnpm --filter e2e exec playwright install chromium   # una sola vez
pnpm test:e2e
```

Necesita `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` reales en el `.env` raíz — sin eso, `apps/backend` no arranca (`NEXT_PUBLIC_SUPABASE_URL` alimenta el JWKS con el que se verifican los tokens ES256 de Supabase Auth) y los tests de Vitest de `apps/backend` tampoco pueden crear usuarios de prueba reales. `test:e2e` es un task separado de `test` en `turbo.json`: si viviera bajo el mismo task, un fallo ahí podría matar tareas hermanas de Vitest a mitad de corrida vía Turborepo y dejar datos de prueba sin limpiar en la base real (nos pasó una vez — ver `DECISIONS.md`).

### Docker

```bash
docker compose -f docker/docker-compose.yml --env-file .env up --build
```

Postgres NO está en el stack — el proyecto usa Supabase gestionado; `DATABASE_URL` en `.env` ya apunta ahí. Ver `DECISIONS.md` para el resto de las decisiones de la topología.

### TypeScript 7 y herramientas de terceros

Este repo usa TypeScript 7 (compilador nativo) en todos los paquetes. Al momento de escribir esto, dos herramientas no lo soportan todavía: el type-checker interno de `next build` (mitigado con `ignoreBuildErrors` + un shim de `postinstall`, ver `apps/frontend/next.config.ts`) y `@typescript-eslint` (por eso `apps/frontend` no tiene script `"lint"` — `pnpm typecheck`, que sí funciona, es el gate real). Ver `DECISIONS.md` para el detalle completo de cada workaround.

## Flujo de trabajo — protocolo "Stop & Ask"

Este repo sigue el loop iterativo definido en [CLAUDE.md](CLAUDE.md) §7: cada fase (PRD/monorepo → BD → dominio compartido → backend → frontend → QA/deploy) se ejecuta como un slice vertical, se testea con comandos reales, y se **espera aprobación explícita antes de avanzar a la siguiente fase**. No se generan módulos backend/frontend adicionales sin luz verde.

## Reglas de código

- Cero código parcial: nada de `// TODO: implementar después`. Todo archivo escrito debe compilar y ser funcionalmente completo.
- Cero mocks en tests de integración: se prueba contra una base de datos real.
- TypeScript estricto en todo el monorepo (ver `tsconfig.json` raíz).
- Cada concepto de networking (`IPAddress`, `SubnetMask`, `Port`, etc.) debe validarse con Zod de forma fiel a su contraparte real — ver `packages/shared` (Fase 3).

## Commits

Mensajes en español o inglés consistentes con el historial existente, formato `tipo: descripción breve` (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`). Las decisiones arquitectónicas relevantes se registran en [DECISIONS.md](DECISIONS.md), no solo en el mensaje de commit.
