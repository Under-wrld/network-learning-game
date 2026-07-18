import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// `eslint-config-next/typescript` (type-aware linting) se omite a propósito:
// @typescript-eslint/typescript-estree todavía depende de la Compiler API
// clásica de TypeScript (ts.createProgram/WatchProgram), que TypeScript 7
// (compilador nativo) eliminó. `pnpm typecheck` (tsc --noEmit, que sí
// funciona con TS7) sigue siendo el gate real de tipos — ver DECISIONS.md.
const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
