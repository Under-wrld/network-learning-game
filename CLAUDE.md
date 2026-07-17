# CLAUDE.md — Plataforma Gamificada de Redes de Computadoras I

Este archivo define cómo debes operar en este repositorio. Léelo por completo antes de tocar cualquier archivo.

## 1. Misión del proyecto

Construir una plataforma web gamificada, de nivel producción, para aprender **Redes de Computadoras I**, alineada estrictamente con _Computer Networks, 5th Edition_ (Tanenbaum & Wetherall), complementada con RFCs de IETF, estándares IEEE y el temario de Cisco Networking Academy. La exactitud técnica es innegociable; la corrección arquitectónica también.

## 2. Roles a adoptar según la tarea

Alterna dinámicamente entre estas perspectivas y valida tus decisiones desde cada una cuando aplique:

- **Product Manager** — define el roadmap MVP iterativo, límites de features, métricas.
- **Arquitecto de Software y BD** — Clean Architecture, DDD, integridad relacional.
- **UX/UI y Game Designer** — loop de enganche, dashboards minimalistas, transiciones fluidas (Framer Motion), motores de canvas de baja latencia (Phaser 3).
- **Tech Lead / Full Stack** — TypeScript estricto, principios SOLID, NestJS idiomático, cero mocks en testing.
- **Security & DevOps** — RBAC, esquemas multi-tenant, sanitización con Zod, topologías Docker, pipelines de assets optimizados.

## 3. Stack y arquitectura obligatoria

Monorepo con **Turborepo** + **pnpm workspaces**. Estructura exacta:

```
/apps/frontend        Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui,
                       Framer Motion, Zustand, React Hook Form, Zod
/apps/backend         NestJS — Clean Architecture (Domain / Application / Infrastructure)
/packages/database    Prisma ORM, migraciones, seeds transaccionales (PostgreSQL)
/packages/shared      Tipos TypeScript compartidos, validadores DTO, constantes
/packages/ui          Librería de componentes compartida (shadcn/ui)
/packages/game-engine Wrappers abstractos de Phaser 3 y loops centrales de simulación
/packages/simulations Lógica React Flow / Konva para topologías de red arrastrables
```

### Modelo de datos (PostgreSQL + Prisma)

Debe normalizar y cubrir:

- **Users**: Id, Email, PasswordHash, Role (STUDENT/TEACHER/ADMIN), Badges, CurrentStreak, TotalXP.
- **Courses / Chapters / Levels** siguiendo la taxonomía de Tanenbaum.
- **Labs & Simulations**: State (jsonb), ValidationCriteria (jsonb).
- **Gamification**: DailyQuests, Leaderboards, AchievementLogs, XPTransactionHistory.
- **Analytics**: UserActivityLogs, AssessmentAttempts, TimeSpentPerModule.

## 4. Los 31 módulos estructurales

1. PRD como markdown en `/docs`.
2. Topología general del sistema.
3. Documentación del modelo DDD.
4. Esquema Prisma normalizado.
5. Layout y segmentación de módulos en Next.js 15 App Router.
6. Módulos backend NestJS (Clean Architecture).
7. Wrapper abstracto de Phaser 3 (flujos de paquetes complejos).
8. Simuladores Konva / React Flow (arrastrar topologías, crear enlaces).
9. Motor de progresión XP/Nivel (escalado exponencial: `XP = 100 × nivel^1.5`).
10. Autenticación segura (Auth.js o Supabase Auth).
11. Gestión de perfiles multi-tenant.
12. Laboratorios de red interactivos virtuales.
13. Motor de evaluación validado con Zod (quizzes, retos abiertos).
14. Economía de recompensas in-game (monedas virtuales, cosméticos).
15. Evaluador multi-trigger de badges y logros.
16. Leaderboard global/por aula en tiempo real.
17. Dashboard de engagement del estudiante (estilo Duolingo/Linear).
18. Consola de administración.
19. Dashboard analítico del profesor (avance y patrones de fallo en redes).
20. Documentación automática Swagger/OpenAPI.
21. Blueprint técnico interactivo de la plataforma.
22. Tests unitarios y de componentes (Vitest).
23. Tests E2E de flujo de usuario (Playwright).
24. Workflow CI/CD multi-etapa (GitHub Actions).
25. Topologías Docker Compose de producción (App, API, DB, Cache).
26. Matriz de despliegue cloud en un solo comando.
27. Guardrails de seguridad (rate limiting, Helmet, CORS, parsing Zod estricto).
28. Optimización de rendimiento (índices Prisma, hidratación RSC).
29. Accesibilidad conforme a Section 508 / WCAG 2.1 AA.
30. Internacionalización con Next-Intl.
31. Logging estructurado (Winston en NestJS) + hooks de analítica Prometheus.

## 5. Motor de simulación y evaluación (núcleo intelectual)

Simuladores interactivos combinando **React Flow** (mapeo de topologías) con **Phaser 3 / Konva** (visualización de bits/paquetes a bajo nivel). Cada simulador necesita un motor determinista independiente que valide las operaciones del estudiante en el servidor, o mediante snapshots de estado firmados criptográficamente en el cliente.

Paradigmas soportados:

- **Capa Física**: tipos de medio, atenuación de señal, cálculo de tasa máxima de datos con Nyquist y Shannon: `C = B·log2(1 + SNR)`.
- **Enlace de Datos y MAC**: construcción de tramas Ethernet, backoff CSMA/CD, caché ARP, tablas de conmutación.
- **Capa de Red**: arrastrar/soltar equipos (routers, switches, PCs), direccionamiento IPv4/IPv6 manual, cálculo de máscaras, VLSM, CIDR, tablas de enrutamiento estático, convergencia RIP/OSPF.
- **Transporte y Aplicación**: handshake TCP de 3 vías, recuperación de pérdida con ventana deslizante, resolución jerárquica DNS, máquina de estados DHCP, mapeos NAT.

## 6. Cobertura curricular obligatoria (referencia Tanenbaum)

- Cap. 1 — Introducción (usos de redes, taxonomías HW/SW, OSI vs TCP/IP).
- Cap. 2 — Capa Física (análisis de Fourier, medios guiados, inalámbrico, PSTN, conmutación, DSL, FTTH).
- Cap. 3 — Enlace de Datos (framing, detección/corrección de errores: CRC, Hamming, protocolos de ventana deslizante).
- Cap. 4 — Subcapa MAC (Ethernet 802.3 clásico/conmutado, Wi-Fi 802.11, switching, VLANs).
- Cap. 5 — Capa de Red (conmutación de paquetes, algoritmos de enrutamiento: vector-distancia, estado de enlace, OSPF, BGP, IPv4, IPv6, subnetting, ICMP).
- Cap. 6 — Capa de Transporte (API de sockets, UDP, RPC, estructura de segmentos TCP, gestión de conexión, control de congestión).
- Cap. 7 — Capa de Aplicación (DNS, correo SMTP/IMAP, HTTP/HTTPS, streaming, CDNs, arquitecturas P2P).
- Cap. 8 — Seguridad en Redes (criptografía AES/RSA, firmas digitales, IPSec, firewalls, VPNs, TLS/SSL).

La capa de aplicación debe incluir placeholders para una **capa de orquestación IA (Tutor IA)** que capture telemetría de `AssessmentAttempts` y genere pistas contextuales sobre errores estructurales de red, sin resolver el ejercicio por el estudiante.

## 7. Protocolo de desarrollo iterativo (obligatorio)

Para maximizar eficiencia de contexto y evitar deriva estructural, sigue este loop exacto:

1. **Fase 1 — Inicialización PRD y Monorepo**
   Estructura Turborepo global, archivos raíz (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`), PRD y arquitectura en `/docs`.
   → **DETENTE Y PIDE APROBACIÓN** antes de generar código de aplicación.

2. **Fase 2 — Diseño de la capa de base de datos**
   `/packages/database/prisma/schema.prisma` con normalización completa, constraints de cascada relacional e índices de performance explícitos. Valida sintaxis. Nada de modelos incompletos.
   → **DETENTE Y PIDE APROBACIÓN**.

3. **Fase 3 — Paquete compartido y definición de dominio**
   Interfaces TypeScript, modelos Zod y esquemas DTO en `/packages/shared`. Cada concepto de red (IPAddress, SubnetMask, Port) debe tener validación estricta fiel a su contraparte real.
   → **DETENTE Y PIDE APROBACIÓN**.

4. **Fase 4 — Infraestructura backend NestJS (módulo por módulo)**
   Setup base de la API. Construye módulos uno a uno con Clean Architecture (Auth, User, Course/Gamification, Simulator Engine). Escribe tests unitarios con Vitest por cada servicio; ejecuta `pnpm --filter backend test`.
   → **DETENTE Y PIDE APROBACIÓN** tras cada módulo estructural completo.

5. **Fase 5 — Frontend Next.js y motor de simuladores**
   Layouts, providers y estado (Zustand). Integra shadcn/ui y Tailwind con temas inspirados en Linear, Duolingo y Notion. Construye los wrappers de canvas interactivo (React Flow + Phaser 3).
   → **DETENTE Y PIDE APROBACIÓN** en cuanto la primera capa interactiva funcione.

6. **Fase 6 — QA, testing E2E y despliegue en contenedores**
   Flujos E2E completos en Playwright apuntando al loop de validación de laboratorios. Entrega Dockerfiles optimizados y stack docker-compose unificado.

## 8. Reglas operativas

- **Prohibido código parcial**: nunca dejes marcadores `// TODO: implementar después`. Todo archivo escrito debe ser sintácticamente válido y completo.
- **Prueba tu trabajo constantemente**: ejecuta comandos reales (`pnpm build`, `vitest run`, etc.) vía terminal.
- **Mantén el contexto anclado**: antes de iniciar cualquier módulo posterior, vuelve a revisar el PRD y los docs generados en la Fase 1.
- **Manejo de errores**: si falla una compilación o un test, analiza el output del compilador, corrige el archivo de inmediato y vuelve a testear antes de pedir ayuda al usuario.

## 9. Prioridad de las reglas

Este documento gobierna el comportamiento por defecto en este repo. Ante instrucciones ambiguas del usuario dentro de una tarea, estas reglas prevalecen salvo que el usuario indique explícitamente lo contrario para esa tarea puntual.
