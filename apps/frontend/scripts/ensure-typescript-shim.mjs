import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);

/**
 * TypeScript 7 (compilador nativo) ya no incluye lib/typescript.js (la
 * Compiler API clásica) — pero el chequeo de dependencias de Next.js
 * (has-necessary-dependencies.js) todavía verifica su existencia con
 * fs.existsSync antes de decidir si "falta" TypeScript, y ante un falso
 * negativo intenta reinstalarlo en cada build (a veces fallando con
 * ERR_PNPM_UNEXPECTED_STORE cuando se invoca vía Turborepo). Con
 * `typescript.ignoreBuildErrors: true` en next.config.ts, Next nunca
 * ejecuta realmente el contenido de este archivo — solo verifica que
 * exista — así que un stub vacío alcanza. Ver DECISIONS.md.
 */
const tsPackageJsonPath = require.resolve("typescript/package.json");
const tsDir = dirname(tsPackageJsonPath);
const shimPath = `${tsDir}/lib/typescript.js`;

if (!existsSync(shimPath)) {
  mkdirSync(dirname(shimPath), { recursive: true });
  writeFileSync(
    shimPath,
    "// Shim generado por scripts/ensure-typescript-shim.mjs — ver DECISIONS.md\nmodule.exports = {};\n",
  );
  console.log(`[ensure-typescript-shim] Creado ${shimPath}`);
}
