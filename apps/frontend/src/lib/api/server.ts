import { createClient } from "../supabase/server";
import { env } from "../env";

/** fetch autenticado hacia apps/backend desde un Server Component/Route Handler. */
export async function serverApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`API error ${response.status}: ${JSON.stringify(body)}`);
  }

  return response.json() as Promise<T>;
}
