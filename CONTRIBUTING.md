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
pnpm lint         # lint de todo el monorepo
pnpm typecheck    # chequeo de tipos de todo el monorepo
pnpm test         # tests (Vitest) de todo el monorepo
```

Para apuntar a un paquete específico: `pnpm --filter backend test`, `pnpm --filter frontend dev`, etc.

## Flujo de trabajo — protocolo "Stop & Ask"

Este repo sigue el loop iterativo definido en [CLAUDE.md](CLAUDE.md) §7: cada fase (PRD/monorepo → BD → dominio compartido → backend → frontend → QA/deploy) se ejecuta como un slice vertical, se testea con comandos reales, y se **espera aprobación explícita antes de avanzar a la siguiente fase**. No se generan módulos backend/frontend adicionales sin luz verde.

## Reglas de código

- Cero código parcial: nada de `// TODO: implementar después`. Todo archivo escrito debe compilar y ser funcionalmente completo.
- Cero mocks en tests de integración: se prueba contra una base de datos real.
- TypeScript estricto en todo el monorepo (ver `tsconfig.json` raíz).
- Cada concepto de networking (`IPAddress`, `SubnetMask`, `Port`, etc.) debe validarse con Zod de forma fiel a su contraparte real — ver `packages/shared` (Fase 3).

## Commits

Mensajes en español o inglés consistentes con el historial existente, formato `tipo: descripción breve` (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`). Las decisiones arquitectónicas relevantes se registran en [DECISIONS.md](DECISIONS.md), no solo en el mensaje de commit.
