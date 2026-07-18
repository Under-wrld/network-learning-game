import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerido"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .url("NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida")
    .min(1, "NEXT_PUBLIC_SUPABASE_URL es requerido para validar tokens de Supabase Auth vía JWKS"),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validación estricta de variables de entorno al bootstrap (CLAUDE.md §1).
 * Falla rápido y con un mensaje claro en vez de dejar que un valor faltante
 * se manifieste como un error críptico en tiempo de request.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }
  return result.data;
}
