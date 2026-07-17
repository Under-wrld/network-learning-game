import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Única fuente de verdad de variables de entorno: el .env en la raíz del
// monorepo (ver .env.example). Evita duplicar secretos en este paquete.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "../../.env") });

// La URL del datasource aquí es la que usan `prisma migrate`/`validate`/
// `studio` — requiere conexión directa (sin pgbouncer), por eso DIRECT_URL
// y no DATABASE_URL. El cliente en runtime (src/index.ts) usa DATABASE_URL
// (pooled) explícitamente al instanciar PrismaClient.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
