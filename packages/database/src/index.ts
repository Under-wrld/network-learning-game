import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

export * from "../generated/prisma/client.js";

/**
 * Cliente Prisma para uso en runtime (apps/backend). Usa la conexión pooled
 * de Supabase (DATABASE_URL) vía driver adapter — obligatorio desde Prisma 7,
 * que ya no acepta una connection string directa en `new PrismaClient()`.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definido. Carga el .env de la raíz del monorepo antes de usar @network-learning-game/database.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

let cachedClient: PrismaClient | undefined;

/**
 * Construcción perezosa: si `prisma` se instanciara al importar este módulo
 * (como en la versión anterior), cualquier consumidor cuyo framework cargue
 * `.env` de forma asíncrona (p. ej. NestJS ConfigModule, cuyo `forRoot()`
 * corre después de que se resuelve el grafo de imports) fallaría, porque
 * `import { prisma } from "..."` en cualquier archivo transitivamente
 * importado dispara la construcción antes de que exista DATABASE_URL. El
 * Proxy difiere la construcción real hasta el primer uso efectivo
 * (p. ej. `prisma.user.findMany()`), momento en el que el bootstrap de la
 * app consumidora ya tuvo oportunidad de cargar el .env.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!cachedClient) {
      cachedClient = createPrismaClient();
    }
    return Reflect.get(cachedClient as object, prop, receiver);
  },
});
