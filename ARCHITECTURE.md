# ARCHITECTURE.md — Topología del sistema

Referencia técnica de cómo encajan las piezas del monorepo. Para el qué y el por qué del producto ver [docs/PRD.md](docs/PRD.md); para las reglas de comportamiento del agente ver [CLAUDE.md](CLAUDE.md).

## 1. Topología general

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────────┐
│  apps/frontend   │  HTTP  │   apps/backend    │  SQL   │   Supabase (Postgres) │
│  Next.js 15      │◄──────►│   NestJS          │◄──────►│   + Supabase Auth     │
│  (App Router)    │  REST  │   Clean Arch.     │ Prisma │                       │
└────────┬─────────┘        └─────────┬─────────┘        └─────────────────────┘
         │                            │
         │ importa tipos/validadores  │ importa tipos/validadores
         ▼                            ▼
   ┌───────────────────────────────────────┐
   │            packages/shared             │
   │  Tipos TS, esquemas Zod, DTOs, const.  │
   └───────────────────────────────────────┘
         ▲                            ▲
         │                            │
┌────────┴─────────┐        ┌─────────┴─────────┐
│ packages/ui       │        │ packages/database  │
│ shadcn/ui compart. │        │ Prisma schema/seeds │
└────────────────────┘        └────────────────────┘

┌────────────────────┐   ┌──────────────────────┐
│ packages/game-engine │   │ packages/simulations   │
│ Wrappers Phaser 3     │   │ React Flow / Konva     │
│ (paquetes/bits)       │   │ (topologías arrastrables)│
└──────────┬────────────┘   └───────────┬────────────┘
           └──────────────┬─────────────┘
                    consumidos por apps/frontend
```

## 2. Apps

### `apps/frontend` — Next.js 15
- App Router, React 19 Server Components por defecto; Client Components solo donde haya interactividad (canvas, formularios, stores de Zustand).
- Estado de cliente: Zustand (sesión de laboratorio en curso, UI transitoria). El estado persistente vive en el backend.
- Validación de formularios: React Hook Form + los mismos esquemas Zod de `packages/shared` (una sola fuente de verdad de validación entre cliente y servidor).
- Estilo: TailwindCSS + shadcn/ui (`packages/ui`), animaciones con Framer Motion.

### `apps/backend` — NestJS
Clean Architecture por módulo, tres capas:
- **Domain**: entidades, value objects (ej. `IPAddress`, `SubnetMask`), reglas de negocio puras, sin dependencias de framework.
- **Application**: casos de uso/servicios que orquestan el dominio; interfaces de repositorio (puertos).
- **Infrastructure**: implementaciones concretas — controllers HTTP, repositorios Prisma, adaptadores de Supabase Auth.

La regla de dependencia es estricta: `Infrastructure → Application → Domain`. El dominio nunca importa de Nest, Prisma ni Express.

## 3. Paquetes compartidos

| Paquete | Contenido |
|---|---|
| `packages/database` | `schema.prisma`, migraciones, seeds transaccionales. Única fuente de verdad del modelo de datos. |
| `packages/shared` | Tipos TypeScript, esquemas Zod (DTOs de request/response, value objects de networking), constantes (tablas de puertos bien conocidos, prefijos CIDR válidos, etc.). Consumido por frontend y backend por igual. |
| `packages/ui` | Componentes shadcn/ui compartidos y tematizados (tema inspirado en Linear/Duolingo/Notion). |
| `packages/game-engine` | Wrapper abstracto sobre Phaser 3 para simulaciones de bajo nivel (flujos de bits/paquetes, animaciones de colisión CSMA/CD). |
| `packages/simulations` | Lógica de simulación basada en React Flow / Konva para topologías arrastrables (routers, switches, PCs, enlaces) — capa de red y superiores. |

## 4. Motor de simulación — contrato determinista

Cada simulador (uno por sub-área curricular: física, enlace/MAC, red, transporte/aplicación) se compone de:

1. **Motor puro** (`packages/simulations` o `packages/game-engine`): función determinista `(estado, acción) → nuevoEstado`, sin efectos secundarios, 100% testeable sin UI.
2. **Validador server-side** (`apps/backend`, dominio `Simulator Engine`): recibe el estado final (o un snapshot firmado del cliente) y lo valida contra `ValidationCriteria` (jsonb) del laboratorio, usando el mismo motor puro compartido vía `packages/shared`/`packages/simulations`.
3. **Renderer** (`apps/frontend`): consume el motor puro y lo dibuja; nunca contiene lógica de validación propia.

Esto garantiza que un estudiante no pueda "ganar" manipulando el cliente: la fuente de verdad de si un ejercicio es correcto vive en el motor puro, ejecutado también en el servidor.

## 5. Capa de datos

PostgreSQL gestionado por Supabase. Prisma es el único cliente de acceso a datos desde `apps/backend` (nunca SQL crudo salvo migraciones explícitas). Ver `packages/database/prisma/schema.prisma` (Fase 2) para el modelo completo.

- Conexión runtime vía pooler de Supabase (pgbouncer, `DATABASE_URL`).
- Migraciones vía conexión directa (`DIRECT_URL`), nunca a través del pooler.

## 6. Autenticación

Supabase Auth es la fuente de verdad de identidad. `apps/backend` valida el JWT emitido por Supabase en cada request (guard de Nest); el rol (`STUDENT`/`TEACHER`/`ADMIN`) se persiste en la tabla `User` de Prisma y se sincroniza con el `user.id` de Supabase.

## 7. Observabilidad

- Logging estructurado: Winston en NestJS, formato JSON en producción.
- Métricas: hooks de analítica compatibles con Prometheus expuestos por `apps/backend`.
- Analítica de producto: tablas `UserActivityLogs`, `AssessmentAttempts`, `TimeSpentPerModule` (Prisma) alimentan el dashboard docente y, a futuro, al Tutor IA.

## 8. Despliegue

- `apps/frontend` → Vercel (ver `.github/workflows/ci-cd.yml`).
- `apps/backend` + Postgres/Cache → Docker Compose (`/docker`, Fase 6) para entornos self-hosted; Supabase gestiona Postgres en producción por defecto.
