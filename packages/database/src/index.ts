import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

export * from "../generated/prisma/client.js";

/**
 * Cliente Prisma para uso en runtime (apps/backend). Usa la conexión pooled
 * de Supabase (DATABASE_URL) vía driver adapter — obligatorio desde Prisma 7,
 * que ya no acepta una connection string directa en `new PrismaClient()`.
 * La app consumidora es responsable de cargar `.env` antes de importar esto.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definido. Carga el .env de la raíz del monorepo antes de importar @network-learning-game/database.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = createPrismaClient();
