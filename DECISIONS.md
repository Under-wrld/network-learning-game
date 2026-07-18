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

## 2026-07-17 — Bug real: el guard de Auth pisaba `lastActivityAt` antes de que corriera la racha

**Decisión**: `PrismaAuthUserRepository.upsertFromClaims` ya no escribe `lastActivityAt` (ni en `create` ni en `update`) — solo sincroniza `email`/existencia.

**Motivo**: detectado por el test e2e del módulo Simulator Engine, no por inspección manual. `SupabaseAuthGuard` corre en *toda* request autenticada y llamaba a `upsertFromClaims`, que ponía `lastActivityAt: new Date()` en cada request — incluyendo la request de `POST /labs/:id/attempts` que un momento después disparaba `RecordActivityUseCase`. Para cuando `computeNextStreak` leía `lastActivityAt`, el guard ya lo había puesto en "hoy" unos milisegundos antes, así que la racha nunca se incrementaba (se interpretaba como "segunda actividad del mismo día"). Un test que llamaba al repositorio o al caso de uso directamente (sin pasar por el guard HTTP) no exponía el bug — solo el flujo HTTP completo lo hacía, lo que confirma el valor de los e2e reales sobre tests unitarios aislados para código que cruza módulos. `lastActivityAt`/racha son responsabilidad exclusiva del módulo User, disparada por acciones de engagement reales (completar un lab), nunca por la mera autenticación de una request.

## 2026-07-17 — Leaderboard MVP: lectura en vivo de `User.totalXp`, sin job de recomputo

**Decisión**: `GET /leaderboard/global` y `GET /leaderboard/classroom/:id` consultan `User.totalXp` directamente (`ORDER BY totalXp DESC`), sin poblar la tabla `LeaderboardEntry` (caché) definida en el schema.

**Motivo**: para el volumen de usuarios del MVP, una lectura en vivo es simple, siempre consistente y suficientemente rápida (índice en `totalXp`). `LeaderboardEntry` queda en el schema para cuando el volumen justifique un job de recomputo periódico (evita re-escribir migraciones más adelante), pero implementarlo ahora sería trabajo sin usuario que lo necesite todavía — documentado como backlog explícito, no como código a medio construir.

## 2026-07-17 — Un solo simulador implementado (VLSM/subnetting), no los ocho capítulos

**Decisión**: `packages/simulations` implementa un único motor determinista (VLSM/subnetting, Capa de Red) con contenido real sembrado (un laboratorio bajo Capítulo 5). `packages/game-engine` (wrappers Phaser 3 para animaciones de bajo nivel: backoff CSMA/CD, flujos de bits) y el constructor de topologías drag-and-drop con React Flow/Konva (módulo 8 completo) quedan sin implementar.

**Alternativas consideradas**: construir un simulador superficial por capítulo para cubrir los 8 capítulos de Tanenbaum con menor profundidad cada uno.

**Motivo**: decisión ya tomada en `docs/PRD.md` §3/§7 desde Fase 1 ("se prioriza profundidad en Capas de Red y Transporte sobre amplitud en las 8") y reafirmada explícitamente por el usuario al pedir avanzar por todas las fases restantes de corrido. `CLAUDE.md` prohíbe código parcial (`// TODO`, lógica vacía); la alternativa de "un poco de cada simulador" habría significado ocho motores a medio terminar en vez de uno completo, testeado con vectores reales, y con validación server-side genuina de punta a punta. Los simuladores restantes quedan en el backlog de `ROADMAP.md`, no como stubs en el código.

## 2026-07-17 — `create-next-app` scaffoleó su propio workspace pnpm dentro del monorepo

**Decisión**: se borraron `apps/frontend/pnpm-workspace.yaml` y `apps/frontend/pnpm-lock.yaml` inmediatamente después de scaffoldear, y se reinstaló desde la raíz.

**Motivo**: `pnpm create next-app` no detecta que corre dentro de un workspace pnpm ya existente y genera su propio `pnpm-workspace.yaml`/lockfile locales, lo que habría fragmentado la resolución de dependencias (dos workspaces anidados). Se realineó `package.json` de `frontend` a mano (nombre `frontend` sin scope, TypeScript 7.0.2, versiones exactas) para que coincida con la convención ya establecida en `database`/`shared`/`simulations`/`backend`.

## 2026-07-17 — shadcn/ui usa el preset `base-nova` (Base UI), no Radix

**Decisión**: los componentes de `apps/frontend/src/components/ui` se generaron con el CLI `shadcn@latest init -d --no-monorepo`, cuyo preset por defecto (`base-nova`) usa `@base-ui/react` como librería de primitivas, no Radix UI. La composición polimórfica (botón-como-`Link`) usa la prop `render` de Base UI, no `asChild` de Radix.

**Motivo**: verificado contra el CLI real (no asumido) — el flag `--base-color` de versiones anteriores del CLI ya no existe, y el preset por defecto cambió de Radix a Base UI. Cualquier componente shadcn nuevo que se agregue debe usarse con la API de Base UI (`render`), documentada en cada componente generado.

## 2026-07-17 — `packages/ui` sigue vacío; no se usó el modo `--monorepo` de shadcn

**Decisión**: los componentes shadcn viven en `apps/frontend/src/components/ui`, no en el paquete compartido `packages/ui` (que `CLAUDE.md` §3 documenta como destino).

**Motivo**: con un solo consumidor (`apps/frontend`), extraer una librería de componentes compartida es abstracción prematura — "tres líneas repetidas es mejor que una abstracción prematura". Si se agrega una segunda app que consuma los mismos componentes, ese es el momento de migrar a `packages/ui` con el modo `--monorepo` del CLI de shadcn.

## 2026-07-17 — Bug real: `zod@3.25.76` duplicado rompía los tipos de `@hookform/resolvers`

**Decisión**: se removió `shadcn` de las `dependencies` de `apps/frontend/package.json` (quedó solo como comando `pnpm dlx shadcn@latest ...`, nunca instalado persistentemente).

**Motivo**: `shadcn init` se agrega a sí mismo como dependency del proyecto. Transitivamente trae `@modelcontextprotocol/sdk` y `zod-to-json-schema`, ambos con `zod@3.25.76` (que además expone un shim de compatibilidad `zod/v4/core` con un version-brand `minor: 0`). Con dos "zod" resueltos en el árbol de `apps/frontend`, TypeScript falló en los overloads de `zodResolver` de `@hookform/resolvers` (`Type '4' is not assignable to type '0'` — comparando el version-brand interno de nuestro zod real 4.4.3 contra el shim v3→v4 de zod 3.25.76). `pnpm why zod` confirmó que `shadcn` era la única fuente de la versión duplicada; quitarlo de dependencies eliminó el conflicto sin tocar la versión de zod del resto del monorepo. `apps/frontend/src/app/globals.css` también dependía de `shadcn/tailwind.css` (utilidades CSS del preset, p. ej. acordeón/scroll-fade/shimmer) — como ningún componente instalado las usa todavía, se quitó el import en vez de copiar ~600 líneas de CSS sin uso.

## 2026-07-17 — Next.js 16 renombró `middleware.ts` a `proxy.ts`

**Decisión**: el archivo de protección de rutas es `apps/frontend/src/proxy.ts`, exportando una función `proxy` (no `middleware`).

**Motivo**: Next.js 16.2.10 deprecó la convención `middleware.ts` en favor de `proxy.ts` (mismo propósito: correr antes de cada request). El build falla explícitamente ("Proxy is missing expected function export name") si el archivo no exporta una función `proxy` o un default export — confirmado contra el error real del compilador, no documentación.

## 2026-07-17 — Duplicación deliberada: `xp-progression.ts` también vive en `packages/shared`

**Decisión**: se agregó `packages/shared/src/gamification/xp-progression.ts` (con tests propios), una copia de la lógica que ya existía en `apps/backend/src/modules/user/domain/xp-progression.ts`.

**Motivo**: el frontend necesita la misma fórmula (`XP = 100 × nivel^1.5`) para renderizar la barra de progreso del dashboard, pero no puede importar código interno de `apps/backend` (no es un paquete). Migrar la implementación existente de `apps/backend` a `packages/shared` y hacer que el backend la reimporte habría sido el fix más "limpio", pero implicaba reescribir imports y volver a correr toda la suite de Auth/User/Simulator ya verificada, en una sesión ya muy extensa. Se optó por duplicar (ambas copias puras, testeadas, derivadas de la única fórmula publicada en `CLAUDE.md`, bajo riesgo de drift) y dejarlo documentado en vez de arriesgar una regresión de último momento en código ya probado.

## 2026-07-17 — Bug real: Next.js 16 + TypeScript 7 — dependencia fantasma y crash de type-check

**Decisión**: `next.config.ts` fija `typescript.ignoreBuildErrors: true`, y `apps/frontend/scripts/ensure-typescript-shim.mjs` (corrido en `postinstall` y antepuesto a `dev`/`build`) crea un archivo stub vacío en `<paquete typescript>/lib/typescript.js`.

**Motivo**: dos bugs reales distintos, ambos originados en que TypeScript 7 (compilador nativo) ya no incluye `lib/typescript.js` (la Compiler API clásica que consumen herramientas de terceros):
1. El type-checker interno de `next build` crasheaba con `The "id" argument must be of type string. Received undefined` al intentar usar esa API inexistente. `ignoreBuildErrors: true` evita que Next intente correrlo — el gate de tipos real del repo es `pnpm typecheck` (`tsc --noEmit` vía la CLI de TS7, que sí funciona).
2. Independientemente de `ignoreBuildErrors`, la verificación de dependencias de Next (`has-necessary-dependencies.js`) sigue comprobando con `fs.existsSync` que ese archivo exista, y al no encontrarlo intenta "reinstalar" TypeScript en cada build — a veces fallando con `ERR_PNPM_UNEXPECTED_STORE` cuando se invoca vía Turborepo. El script crea un stub vacío que solo necesita *existir* (nunca se `require()`ea de verdad, dado que `ignoreBuildErrors` ya deshabilitó el único code path que lo haría), eliminando el intento de reinstalación por completo. Corre en `postinstall` para que sea reproducible en CI/Docker/Vercel/Railway, no solo en esta máquina.

## 2026-07-17 — `pnpm lint` deshabilitado en `apps/frontend`: `@typescript-eslint` no soporta TypeScript 7

**Decisión**: se removió el script `"lint"` de `apps/frontend/package.json`. `eslint.config.mjs` quedó sin la config `eslint-config-next/typescript` (type-aware), documentando el motivo.

**Alternativas consideradas**: desactivar solo las reglas type-aware manteniendo el parser de `@typescript-eslint`; esperar una versión más nueva de `@typescript-eslint`.

**Motivo**: `@typescript-eslint/typescript-estree@8.64.0` (la última publicada — verificado con `pnpm view`) crashea (`Cannot read properties of undefined (reading 'Cjs')`) al parsear *cualquier* archivo `.ts`/`.tsx` bajo TypeScript 7, porque construye un "watch program" incondicionalmente como parte de su pipeline de parseo — no es un chequeo type-aware opcional que se pueda desactivar por config, ocurre antes de que corra ninguna regla. `pnpm typecheck` (tsc --noEmit, funcionando correctamente en los 6 paquetes) sigue siendo el gate de corrección de tipos; el lint de estilo queda pendiente hasta que `@typescript-eslint` publique soporte para TS7 — el resto del monorepo (`database`/`backend`/`shared`/`simulations`) tampoco definía un script `"lint"` propio, así que esto es consistente con el estado previo, no una regresión nueva.

## 2026-07-17 — Docker: `pnpm deploy` en vez de copiar `node_modules` completo

**Decisión**: los Dockerfiles de `backend` y `frontend` construyen el monorepo completo en una etapa `builder` y usan `pnpm --filter <app> deploy --prod /deploy` (backend) o `output: "standalone"` de Next.js (frontend) para producir una carpeta final mínima y autocontenida, en vez de copiar el `node_modules` completo del monorepo a la imagen final.

**Motivo**: dos problemas reales encontrados y resueltos, no hipotéticos:
1. `pnpm deploy` en pnpm 11 requiere `injectWorkspacePackages: true` en `pnpm-workspace.yaml` (si no, falla con `ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE`) — confirmado contra el error real del CLI.
2. Los paquetes `database`/`shared`/`simulations` no tenían campo `"files"` en su `package.json`, y su `dist/` está gitignored. El empaquetado de `pnpm deploy` respeta esa exclusión por defecto, así que sin un `"files": ["dist"]` explícito, el `dist/` compilado se habría quedado afuera de la imagen final — un contenedor que arranca pero no encuentra sus propios módulos compilados. Se agregó `"files": ["dist"]` a los cuatro `package.json` (`database`, `shared`, `simulations`, `backend`) y se verificó con `docker run` real que `node_modules/@network-learning-game/database/dist/{src,generated}` efectivamente están presentes en la imagen.

Ambos Dockerfiles se construyeron y corrieron de verdad (`docker build` + `docker run`, no solo se escribieron): el backend registra todas sus rutas y responde `/health`; el frontend sirve `/` y `/login` con contenido real.

## 2026-07-18 — Bug crítico real: Supabase Auth firma los access tokens con ES256 (JWKS), no HS256

**Decisión**: `JwtTokenVerifier` (módulo Auth) se reescribió para verificar tokens contra el JWKS público del proyecto (`jose`, `createRemoteJWKSet` + `jwtVerify`), no contra un secreto compartido HS256. `SUPABASE_JWT_SECRET` se eliminó por completo del proyecto (`env.schema.ts`, `.env`, `.env.example`, `docker-compose.yml`, `ci-cd.yml`); `NEXT_PUBLIC_SUPABASE_URL` pasó a ser también una variable requerida por `apps/backend` (construye la URL del JWKS: `.../auth/v1/.well-known/jwks.json`).

**Alternativas consideradas**: ninguna — no existe una alternativa HS256 válida para este proyecto Supabase; el fix es correctivo, no una elección de diseño entre opciones igualmente válidas.

**Motivo**: bug de arquitectura introducido en Fase 4, invisible hasta el primer smoke test con un token *genuinamente* emitido por Supabase (bloqueado hasta ahora por depender de que el usuario completara el login real end-to-end). La entrada de Fase 4 sobre HS256 (ver arriba, "Tests del módulo Auth") documentaba la inferencia — hecha inspeccionando el header de las API keys `anon`/`service_role` (`alg: HS256`) — de que Supabase firmaba también los access tokens de sesión con ese mismo algoritmo. Esa inferencia era razonable pero **incorrecta**: las API keys y los access tokens de sesión son JWTs distintos con firmantes distintos. Se confirmó decodificando (sin verificar) el header de un token real, obtenido creando un usuario de verdad vía la Admin API de Supabase e iniciando sesión de verdad: `{"alg":"ES256","kid":"ff202248-..."}`. Ningún valor de `SUPABASE_JWT_SECRET` — real o no — podía haber hecho funcionar la verificación original; el guard rechazaba con 401 todo token real desde el primer día, enmascarado porque los 50 tests del módulo Auth firmaban sus propios tokens de prueba con HS256 y el mismo secreto de prueba, nunca contra el JWKS real (ver entrada anterior "Tests del módulo Auth"). El payload decodificado también confirmó que `email` sí viene incluido directamente en el claim (no hacía falta un fallback a `user_metadata`), así que `VerifiedTokenClaims { sub, email }` no cambió de forma.

**Consecuencia en testing**: los 5 specs e2e de `apps/backend` (Auth/User/Course/Simulator + el unit spec del verifier) se reescribieron para crear usuarios reales vía la Admin API de Supabase e iniciar sesión de verdad, obteniendo tokens ES256 genuinos — coherente con "cero mocks", y el único enfoque que hubiera detectado este bug antes de un smoke test manual. Se agregó `apps/backend/test/support/supabase-test-auth.ts` como helper compartido. El unit spec del verifier también prueba el rechazo de un token firmado con una clave ES256 real pero no registrada en el JWKS del proyecto (vía `jose.generateKeyPair`), sin mockear la librería de verificación.

## 2026-07-18 — Bug real: upsert de usuario nuevo no era seguro bajo concurrencia real

**Decisión**: `PrismaAuthUserRepository.upsertFromClaims` atrapa `Prisma.PrismaClientKnownRequestError` con `code === "P2002"` y, en ese caso, relee la fila por `id` en vez de propagar el error.

**Motivo**: bug real expuesto por el primer E2E que corrió de punta a punta con el fix de JWKS (antes, todo fallaba en 401 antes de llegar a este código). El primer login de un usuario nuevo dispara más de un request server-side a rutas que sincronizan el perfil casi simultáneamente (p. ej. el prefetch automático de `<Link>` de Next.js sobre `/classrooms`, que también llama a `/users/me`, mientras `/dashboard` hace su propia llamada). El `ON CONFLICT` del `upsert` de Prisma solo cubre la unicidad de `id`: si dos INSERT compiten por crear la misma fila nueva, el segundo puede chocar contra la unicidad de `email` — una constraint distinta a la del conflict target — y Postgres lo reporta como error en vez de convertirlo en `UPDATE`. Como ambos escritores usan el mismo `id` y el mismo `email` (vienen del mismo claim JWT), el perdedor de la carrera solo necesita releer lo que el ganador ya escribió. Se agregó un test de regresión que dispara dos `upsertFromClaims` concurrentes para el mismo usuario nuevo (`apps/backend/test/auth/prisma-auth-user.repository.spec.ts`).

## 2026-07-18 — Bug real: `golden-path.spec.ts` dejaba filas huérfanas en `public.users`

**Decisión**: el `afterAll` de `apps/e2e/tests/golden-path.spec.ts` ahora borra también `XPTransaction`/`LabAttempt`/`CourseEnrollment`/`User` (Prisma) antes de borrar el usuario en Supabase Auth — antes solo borraba el lado de Supabase Auth.

**Motivo**: detectado al auditar el estado real de la base tras varias corridas de este mismo fix — 7 filas huérfanas en `public.users`, cada una con el email aleatorio de una corrida distinta, porque el login real sincroniza el perfil en `public.users` (tabla propia, gestionada por Prisma) pero `admin.auth.admin.deleteUser` solo afecta el esquema `auth` interno de Supabase. Mismo patrón de bug operativo que la entrada anterior sobre los 5 usuarios sin limpiar por el conflicto de Turborepo — la lección general (verificar el estado real de la base tras cada corrida de E2E, no asumir que el cleanup funcionó) se aplicó activamente acá y permitió detectarlo antes de que el usuario lo reportara.

## 2026-07-18 — `next start` no sirve el build `output: "standalone"`; script propio para levantarlo localmente

**Decisión**: el script `"start"` de `apps/frontend/package.json` pasó de `"next start"` a `"node scripts/start-standalone.mjs"`, que copia `.next/static` y `public/` dentro de `.next/standalone/apps/frontend/` (como hace el `Dockerfile` en su etapa `runner`) y arranca ese `server.js` directamente.

**Motivo**: `next.config.ts` fija `output: "standalone"` desde Fase 6 (para las imágenes Docker), pero eso hace que `next start` sea explícitamente incompatible (Next.js lo advierte en stderr y no sirve nada útil) — visible únicamente al correr Playwright de verdad contra un build real, no en `next dev`. El `webServer` de `apps/e2e/playwright.config.ts` invoca `pnpm --filter frontend run start`, así que sin este fix el E2E nunca hubiera podido levantar el frontend en modo producción. El script es la única forma de reusar el mismo build standalone tanto en Docker (`Dockerfile`, `COPY` multi-stage) como localmente (copia real de archivos vía Node), sin mantener dos configuraciones de build distintas.

## 2026-07-18 — Locators de Playwright deben apuntar a `data-testid`, no a texto ambiguo

**Decisión**: se agregaron `data-testid="total-xp-badge"` (dashboard) y `data-testid="lab-result"` (simulador VLSM) a los componentes del frontend, y `golden-path.spec.ts` los usa en vez de `page.getByText(...)` con substrings cortos.

**Motivo**: el primer E2E que corrió de punta a punta (tras el fix de JWKS) expuso que `getByText("0 XP")` y `getByText(/\+150 XP/)` violan el modo estricto de Playwright — matchean más de un elemento real de la UI (la barra de progreso de nivel también contiene el substring "0 XP"; el toast de éxito y el panel de resultado persistente ambos contienen "+150 XP"). Ninguna de las dos coincidencias es un bug de la UI — son dos piezas de información legítimas y distintas que comparten texto. La solución correcta es un selector estable y semántico, no un regex más específico que se puede volver a romper con el próximo cambio de copy.

## 2026-07-17 — Sin Postgres en `docker-compose.yml`; Redis provisto pero no integrado

**Decisión**: `docker/docker-compose.yml` define `backend`, `frontend` y `redis` — no un servicio de Postgres, pese a que `CLAUDE.md` módulo 25 pide "App, API, DB, Cache".

**Motivo**: coherente con la decisión ya tomada de usar Supabase como Postgres gestionado (ver entrada anterior sobre Supabase) — un Postgres local en el compose sería una segunda base de datos que nadie usaría, ya que `DATABASE_URL`/`DIRECT_URL` apuntan a Supabase incluso corriendo este stack localmente. Redis sí se incluye (cumple el requisito de "Cache" del módulo 25) pero **no está todavía integrado en la lógica de `apps/backend`** (sin rate limiting ni caché real usándolo) — queda provisto y listo para cuando se implemente, documentado como tal en vez de presentado como una feature terminada.

## 2026-07-17 — Bug operativo real: un fallo en E2E mató la limpieza de tests de Vitest a mitad de corrida

**Decisión**: `apps/e2e`'s script se renombró de `"test"` a `"test:e2e"`, con su propio task de Turborepo (`test:e2e`, `cache: false`), separado del task `"test"` que usan `database`/`shared`/`simulations`/`backend`.

**Motivo**: bug real observado, no anticipado por diseño. Al correr `pnpm test` desde la raíz con `apps/e2e` todavía usando el nombre de script `"test"`, Turborepo ejecutó los tasks de Vitest y Playwright en paralelo; cuando Playwright falló rápido (por `SUPABASE_JWT_SECRET` inválido, bloqueando el arranque del backend vía `webServer`), Turborepo cortó tareas hermanas de Vitest a mitad de ejecución. Eso interrumpió los hooks `afterAll` de limpieza de varios specs de `apps/backend`, dejando **5 usuarios de prueba reales sin borrar** en la base de Supabase (detectado y corregido manualmente). Separar `test:e2e` de `test` como tasks distintos de Turborepo evita que Playwright (que necesita infraestructura completamente distinta: ambos servers corriendo, browser, credenciales reales) pueda interrumpir la suite de Vitest, que si es segura de correr en cualquier momento. Regla general para el resto del proyecto: cualquier suite que dependa de servicios externos completos (no solo la DB) debe tener su propio task de Turborepo, nunca compartir `"test"`.
