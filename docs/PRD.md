# PRD — Plataforma Gamificada de Redes de Computadoras I

- **Estado**: Fase 1 (Inicialización)
- **Owner**: Sebastian Negrete
- **Referencia curricular**: *Computer Networks, 5th Edition* (Tanenbaum & Wetherall), RFCs IETF, estándares IEEE, temario Cisco Networking Academy.

## 1. Problema y visión

Enseñar Redes de Computadoras I es difícil de forma puramente teórica: conceptos como el algoritmo de backoff de CSMA/CD, la convergencia de OSPF o el control de congestión de TCP son procesos dinámicos que un diagrama estático no transmite. La plataforma resuelve esto con **simuladores interactivos deterministas** por capa OSI/TCP-IP, envueltos en un **loop de gamificación** (XP, streaks, badges, leaderboards) que sostiene la motivación a lo largo de un curso completo.

La exactitud técnica de cada simulador es innegociable: cada validación de ejercicio debe ser fiel al comportamiento real del protocolo que representa, no una aproximación pedagógica simplificada.

## 2. Usuarios objetivo

| Rol | Necesidad principal |
|---|---|
| **Estudiante** (`STUDENT`) | Practicar conceptos de networking con feedback inmediato, ver su progreso (XP, nivel, racha), competir en un leaderboard de su clase. |
| **Docente** (`TEACHER`) | Asignar laboratorios/cursos a su aula, ver dashboard analítico de avance y patrones de error de sus estudiantes, ajustar dificultad. |
| **Administrador** (`ADMIN`) | Gestionar cursos, usuarios, tenants (instituciones/aulas), moderar contenido. |

## 3. Alcance del MVP (iterativo)

El MVP se construye como **slices verticales** completos (auth → un curso → un laboratorio → gamificación básica) antes de expandir horizontalmente a más capítulos o simuladores. Ver [ROADMAP.md](../ROADMAP.md) para el desglose fase a fase.

### Dentro de alcance (MVP)
- Autenticación (Supabase Auth) y RBAC de 3 roles.
- Modelo curricular: Cursos → Capítulos → Niveles, siguiendo la taxonomía de Tanenbaum (Cap. 1–8, ver Sección 6 de `CLAUDE.md`).
- Al menos un simulador completo y determinista por capa antes de avanzar a la siguiente (empezando por Capa de Red: subnetting/VLSM, por ser el núcleo de Redes I).
- Motor de progresión XP/Nivel (`XP = 100 × nivel^1.5`), badges, streaks.
- Dashboard de estudiante y dashboard analítico de docente.
- Motor de evaluación con Zod (quizzes cerrados + retos abiertos validados server-side).

### Fuera de alcance (post-MVP)
- Tutor IA con generación de pistas en tiempo real (se deja **contrato/interfaz** listo desde el día uno, sin implementación de modelo).
- Economía de cosméticos/monedas virtuales avanzada.
- Internacionalización completa (se deja la arquitectura Next-Intl lista, contenido solo en español inicialmente).
- Multi-tenant white-label completo (se soporta aulas/instituciones, no branding por tenant).

## 4. Métricas de éxito

- **Activación**: % de usuarios que completan su primer laboratorio en la primera sesión.
- **Retención**: streak promedio a 7 y 30 días.
- **Precisión pedagógica**: % de intentos de laboratorio validados correctamente sin falsos positivos/negativos del motor determinista (objetivo: 100% — es un simulador, no un juicio subjetivo).
- **Adopción docente**: # de aulas activas con al menos un curso asignado.

## 5. Requisitos no funcionales

- **Corrección técnica**: cada simulador debe pasar tests unitarios que verifiquen su fidelidad al protocolo real (ej. cálculo de subnetting, tabla de verdad de Hamming, three-way handshake) antes de exponerse a estudiantes.
- **Seguridad**: RBAC estricto, validación Zod en cada boundary (API, formularios), rate limiting, sin secretos en el repo (ver `.env.example`).
- **Rendimiento**: hidratación RSC optimizada en Next.js, índices Prisma explícitos en cascadas y foreign keys de alta cardinalidad (logs de actividad, intentos de evaluación).
- **Accesibilidad**: WCAG 2.1 AA / Section 508 en toda la UI, incluyendo los canvases interactivos (controles alternativos por teclado donde el drag-and-drop sea la interacción primaria).
- **Testing sin mocks**: los tests de integración corren contra una base de datos real (Postgres vía Supabase local o contenedor), no mocks del ORM.

## 6. Arquitectura de referencia

Ver [ARCHITECTURE.md](../ARCHITECTURE.md) para la topología de sistema y [CLAUDE.md](../CLAUDE.md) §3–§6 para el stack y la cobertura curricular completa.

## 7. Riesgos conocidos

- **Complejidad de los motores deterministas**: cada simulador (física, enlace, red, transporte) es esencialmente un mini-intérprete de protocolo; subestimar su esfuerzo de testing es el riesgo #1 del proyecto.
- **Fidelidad curricular vs. tiempo de desarrollo**: cubrir los 8 capítulos de Tanenbaum con simuladores de igual profundidad no es realista para un MVP; se prioriza profundidad en Capas de Red y Transporte (núcleo de "Redes I") sobre amplitud en las 8.
- **Multi-tenancy tardío**: si el modelo de datos no aísla `Course`/`Leaderboard` por aula desde el schema inicial (Fase 2), el retrofit es costoso.
