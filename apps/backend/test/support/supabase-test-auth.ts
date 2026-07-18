import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * Helper compartido por los specs e2e para obtener access tokens *reales*
 * de Supabase Auth (ES256, firmados con la clave real del proyecto) en vez
 * de fabricar JWTs locales — el bug que motivó esta reescritura (ver
 * DECISIONS.md) era invisible a los tests viejos precisamente porque
 * firmaban tokens con un secreto HS256 que Supabase nunca usa en producción.
 */

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = "Vitest-Real-Auth-Test-Pw-1!";

export interface RealTestUser {
  id: string;
  email: string;
  accessToken: string;
}

export async function createRealTestUser(emailPrefix: string): Promise<RealTestUser> {
  const email = `${emailPrefix}-${randomUUID()}@example.com`;

  const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (createError || !createData.user) {
    throw createError ?? new Error("No se pudo crear el usuario de prueba en Supabase Auth");
  }

  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password: TEST_PASSWORD,
  });
  if (signInError || !signInData.session) {
    throw signInError ?? new Error("No se pudo iniciar sesión con el usuario de prueba");
  }

  return { id: createData.user.id, email, accessToken: signInData.session.access_token };
}

export async function deleteRealTestUser(userId: string): Promise<void> {
  await adminClient.auth.admin.deleteUser(userId);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} es requerido en .env para correr los tests e2e contra Supabase Auth real`);
  }
  return value;
}
