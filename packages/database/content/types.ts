/**
 * Forma del contenido curricular gamificado, consumido por prisma/seed.ts
 * para poblar Chapter/Level/Assessment. `LevelContent.sections`/
 * `realWorldApplication` se guardan tal cual en `Level.content` (JSONB) —
 * el frontend los renderiza directamente; `miniQuiz`/`BossBattleContent`
 * mapean a `Assessment` (type QUIZ), con sus preguntas en `Assessment.questions`.
 *
 * Nota de alcance (ver DECISIONS.md): el modelo Assessment/AssessmentAttempt
 * ya existe en el schema, pero todavía no hay módulo de backend ni UI de
 * frontend que permita *rendir* un quiz y ganar su XP — a diferencia de Lab
 * (Simulator Engine), que sí está completo de punta a punta. Este contenido
 * queda sembrado y listo; falta ese motor para que sea jugable.
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Índice (0-based) de `options` que es la respuesta correcta. */
  correctIndex: number;
  explanation: string;
}

export interface ContentSection {
  heading: string;
  /** Markdown. Puede incluir listas, negrita, código inline. */
  body: string;
}

export interface LevelContent {
  order: number;
  title: string;
  description: string;
  /** XP por completar la lectura + mini-quiz de este nivel (no incluye labs). */
  xpReward: number;
  sections: ContentSection[];
  realWorldApplication: string;
  miniQuiz: QuizQuestion[];
}

export interface BossBattleContent {
  title: string;
  description: string;
  /** Puntaje mínimo (0-100) para aprobar. */
  passingScore: number;
  maxXp: number;
  questions: QuizQuestion[];
}

export interface ChapterContent {
  tanenbaumChapter: number;
  courseSlug: string;
  /** Nivel de jugador (User.totalXp → levelForXp) recomendado antes de empezar — descriptivo, no impone un gate real todavía. */
  levelRequired: number;
  levels: LevelContent[];
  bossBattle: BossBattleContent;
}
