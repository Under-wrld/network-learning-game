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

## 2026-07-17 — `User` sin `passwordHash`, pese a que `CLAUDE.md` §3 lo lista

**Decisión**: el modelo `User` de Prisma no incluye un campo `passwordHash`. `User.id` es un `Uuid` sin `@default`, que la Application layer (Fase 4, módulo Auth) debe poblar con el mismo `id` que Supabase asigna en `auth.users` al registrar la cuenta.

**Alternativas consideradas**: agregar `passwordHash` tal como lo enumera literalmente `CLAUDE.md` §3.

**Motivo**: esa lista de campos en `CLAUDE.md` fue escrita cuando la elección de auth (Auth.js vs. Supabase Auth) seguía abierta. Ya decidido Supabase Auth (entrada anterior), el password hash real vive en el esquema `auth` de Supabase, gestionado por Supabase — duplicarlo en `public.users` crearía una segunda fuente de verdad de credenciales que nadie mantiene ni rota, es decir, un riesgo de seguridad sin beneficio. No se mapeó `auth.users` vía `multiSchema` de Prisma por ser una tabla interna de Supabase fuera de nuestro control de esquema; la sincronización de `id`/`email`/`role` es responsabilidad explícita del módulo `Auth` en Fase 4.

## 2026-07-17 — Prisma 7: `prisma.config.ts` obligatorio y cliente basado en driver adapters

**Decisión**: se usa Prisma `7.8.0`, cuya arquitectura difiere de forma importante de versiones anteriores (5.x/6.x):
- La URL de conexión para el CLI (`migrate`, `validate`, `studio`) vive en `packages/database/prisma.config.ts`, no en `schema.prisma`. El campo `datasource.directUrl` fue removido del lenguaje de schema; solo queda `url` (mapeado a `DIRECT_URL`, la conexión sin pgbouncer que las migraciones necesitan).
- El generador de cliente es `"prisma-client"` (no el legacy `"prisma-client-js"`), con `output = "../generated/prisma"` — emite TypeScript fuente, no JS pre-compilado, así que `packages/database/tsconfig.json` compila explícitamente tanto `src/**` como `generated/**`.
- `PrismaClient` ya no acepta una connection string directa ni `datasources.db.url`: exige un **driver adapter**. Se usa `@prisma/adapter-pg` + `pg`, instanciado con `DATABASE_URL` (pooled) en `src/index.ts`.

**Motivo**: verificado empíricamente contra la CLI real (no supuesto) — `prisma validate` rechazó `directUrl` en el schema con un error explícito, y los tipos de `@prisma/client`/`internal/prismaNamespace.ts` confirman que `PrismaClientOptions` es una unión discriminada `{ adapter } | { accelerateUrl }`, sin tercera opción. Cualquier código futuro (Fase 4, NestJS) que instancie `PrismaClient` directamente debe seguir el mismo patrón de `src/index.ts`, no ejemplos de Prisma 5/6 de la documentación general.

## 2026-07-17 — `packages/shared` no depende de `@prisma/client`

**Decisión**: `packages/shared/src/enums` redefine `Role`, `AttemptStatus`, `AssessmentType` y `LeaderboardScope` como Zod enums propios, en vez de reexportar los enums generados por Prisma (`packages/database/generated/prisma`).

**Alternativas consideradas**: importar y reexportar los enums de `@prisma/client` directamente desde `packages/shared`, evitando duplicación.

**Motivo**: `packages/shared` lo consume tanto `apps/backend` como `apps/frontend`. El cliente de Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) incluye binarios/engines nativos y código exclusivo de Node — filtrarlo a un bundle de navegador vía una dependencia transitiva de `packages/shared` rompería el build de Next.js o infllaría el bundle innecesariamente. El costo es que la Fase 4 (capa de infraestructura del backend) debe mapear explícitamente entre los enums de Prisma y los de `packages/shared` en el límite del repositorio — documentado como comentario en `packages/shared/src/enums/domain-enums.ts`.

## 2026-07-17 — Tests Vitest en `packages/shared` antes del módulo 22 formal

**Decisión**: se agregó Vitest y una suite de 83 tests para los value objects de networking en Fase 3, aunque `CLAUDE.md` lista "Tests unitarios y de componentes (Vitest)" como módulo 22, más adelante en el roadmap.

**Motivo**: estos value objects (parsing IPv4/IPv6, aritmética de subnetting, clasificación de MAC) son lógica de dominio pura y determinista — exactamente el tipo de código donde `CLAUDE.md` exige "validación estricta fiel a su contraparte real". La única forma de demostrar esa fidelidad (y no solo afirmarla) es contra vectores de prueba reales de RFC, así que se testearon en el momento en que se escribieron en vez de diferir a un módulo de testing posterior. El módulo 22 seguirá cubriendo el resto del monorepo (componentes, servicios NestJS) a medida que existan.

## 2026-07-17 — Multi-tenancy (`Classroom`) y `LeaderboardEntry` como caché, no fuente de verdad

**Decisión**: se agregaron `Classroom` y `ClassroomMembership` (no mencionados explícitamente en `CLAUDE.md` §3) para soportar "aulas" — requerido por el módulo 11 (perfiles multi-tenant) y el módulo 16 (leaderboard "global/por aula"). `LeaderboardEntry` es una tabla de snapshot/caché sin `@@unique` sobre `(scope, classroomId, userId)`: Postgres no trata `NULL` como igual a sí mismo en constraints únicos, así que un `@@unique` con `classroomId` nulo (caso `GLOBAL`) no habría prevenido duplicados. La unicidad real la garantiza el job de recomputo (delete-then-insert por scope), documentado como comentario en el schema.

## 2026-07-17 — `apps/backend` es ESM, no CommonJS (contra la convención más común de NestJS)

**Decisión**: `apps/backend` usa `"type": "module"` + `module`/`moduleResolution: "NodeNext"`, igual que `packages/database` y `packages/shared`, en vez del CommonJS que la mayoría de proyectos NestJS usa por defecto.

**Alternativas consideradas**: CommonJS (`module: "CommonJS"`), apoyándose en que Node 22+/24 soporta `require()` síncrono de paquetes ESM sin top-level await — se verificó empíricamente que esto funciona a nivel de Node runtime.

**Motivo**: aunque Node permite `require(esm)` en runtime, el checker de TypeScript en modo `Node16`/`NodeNext` (obligatorio en TS 7, ver entrada siguiente) rechaza en tiempo de compilación cualquier import de **valor** (no solo de tipo) desde un archivo CommonJS hacia un paquete ESM puro — error TS1479, sin importar que Node lo soportaría en runtime. Como `apps/backend` necesita importar valores reales de `@network-learning-game/database` (`prisma`) y `@network-learning-game/shared`, no solo tipos, la dirección CJS→ESM queda bloqueada por el compilador. La dirección inversa (ESM importando CommonJS, como `@nestjs/core`) siempre fue soportada sin fricción por Node y TypeScript. Se verificó con un smoke test real (`require()` de ambos paquetes desde un script `.cjs`) antes de decidir, y se optó por evitar la fricción por completo en vez de pelear contra el checker.

## 2026-07-17 — TypeScript 7: `moduleResolution: "node"/"node10"` fue removido

**Decisión**: ningún `tsconfig.json` del repo usa `moduleResolution: "node"` (el valor clásico). Los valores válidos en TS 7.0.2 son únicamente `node16`, `nodenext` y `bundler` — confirmado con `tsc --help --all` tras un error real (TS5108) al intentar usar `"Node"`. Además, `module: "Node16"`/`"NodeNext"` exige que `moduleResolution` tenga el mismo valor (TS5110); no se pueden mezclar `module: "CommonJS"` con `moduleResolution: "Node16"`.

**Motivo**: verificado contra el compilador real instalado, no contra documentación potencialmente desactualizada — el mismo patrón que las sorpresas de Prisma 7 y Zod 4 (ver entradas anteriores). Cualquier tsconfig nuevo en el repo debe usar `nodenext` (paquetes ESM) o `bundler` (código consumido por un bundler, p. ej. Next.js en Fase 5), nunca `node`/`node10`.

## 2026-07-17 — `prisma` en `packages/database` pasó de instanciación eager a un Proxy perezoso

**Decisión**: `packages/database/src/index.ts` ya no construye `PrismaClient` al importar el módulo (`export const prisma = createPrismaClient()`); ahora exporta un `Proxy` que difiere la construcción real hasta el primer acceso a una propiedad (p. ej. `prisma.user.findMany`).

**Motivo**: bug real descubierto al arrancar `apps/backend` — NestJS's `ConfigModule.forRoot()` carga el `.env` raíz recién durante el bootstrap del `AppModule`, pero el import de `AppModule` en `main.ts` resuelve (y evalúa) todo el grafo de módulos transitivos — incluyendo `PrismaAuthUserRepository` → `@network-learning-game/database` — **antes** de que `main.ts` ejecute una sola línea propia. Con instanciación eager, `createPrismaClient()` corría sin que `DATABASE_URL` existiera todavía en `process.env`, y el arranque fallaba con un error genérico de módulo en vez de nuestro propio mensaje. El Proxy hace que cualquier consumidor (esta app, tests futuros, otras apps) sea seguro sin importar cuándo cargue sus variables de entorno, siempre que lo haga antes del primer query real — no solo antes del import.

## 2026-07-17 — Tests del módulo Auth: JWT firmado con secreto de prueba, no el secreto real de Supabase

**Decisión**: los 12 tests del módulo Auth (verificación JWT, repositorio, e2e HTTP) usan un `SUPABASE_JWT_SECRET` de prueba fijo en el propio test, no el secreto real del proyecto Supabase (que además no se pegó en el chat, a propósito).

**Motivo**: es una elección de testing legítima — se ejercita la lógica real de firma/verificación HS256 con `jsonwebtoken` (sin mocks de la librería de criptografía) y el repositorio real contra la base de datos real de Supabase (con limpieza verificada: 0 usuarios residuales tras la corrida completa). Lo único que no se puede probar todavía es que un token *genuinamente emitido por Supabase* (tras un login real) sea aceptado — eso requiere `SUPABASE_JWT_SECRET` real en `.env`, pendiente de que el usuario lo agregue, y en última instancia un flujo de login real desde el frontend (Fase 5).

**Motivo**: cubrir el requisito de multi-tenancy y leaderboards por aula del PRD sin introducir una constraint de base de datos que no puede expresar correctamente la semántica deseada.
