// `next start` no funciona con `output: "standalone"` (ver next.config.ts):
// el build standalone es un server.js autocontenido que espera sus propios
// `.next/static` y `public` junto a sí mismo — normalmente los copia un
// Dockerfile multi-stage (ver apps/frontend/Dockerfile). Este script hace el
// mismo copiado para poder levantar el build de producción localmente
// (usado por Playwright y por cualquier smoke test manual).
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "..");
const standaloneFrontendDir = path.join(frontendDir, ".next", "standalone", "apps", "frontend");

if (!existsSync(standaloneFrontendDir)) {
  console.error("No se encontró .next/standalone/apps/frontend — corré `pnpm build` primero.");
  process.exit(1);
}

cpSync(path.join(frontendDir, ".next", "static"), path.join(standaloneFrontendDir, ".next", "static"), {
  recursive: true,
});
cpSync(path.join(frontendDir, "public"), path.join(standaloneFrontendDir, "public"), { recursive: true });

const child = spawn(process.execPath, [path.join(standaloneFrontendDir, "server.js")], {
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
