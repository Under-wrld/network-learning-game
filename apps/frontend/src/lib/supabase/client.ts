import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";

/** Cliente Supabase para Client Components (usa cookies del navegador). */
export function createClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
