-- Habilita Row Level Security en todas las tablas de public, expuestas por
-- defecto vía la API PostgREST de Supabase con la anon key (pública, embebida
-- en el bundle del cliente). Sin RLS, cualquiera puede leer/escribir estas
-- tablas directamente saltándose por completo el backend NestJS — confirmado
-- real (no solo el advisor): un PATCH con la anon key modificó public.courses
-- de verdad antes de este fix.
--
-- apps/backend nunca pasa por PostgREST: se conecta directo a Postgres
-- (DATABASE_URL/DIRECT_URL) como dueño de las tablas, y el dueño de una tabla
-- siempre bypassea RLS (a menos que se use FORCE ROW LEVEL SECURITY, que
-- deliberadamente NO se usa acá). No se definen policies: ENABLE sin policies
-- deniega por defecto a cualquier rol que no sea el dueño — exactamente lo
-- que corresponde, dado que toda la autorización real ya vive en NestJS
-- (guards, RolesGuard) y no hay ningún uso legítimo de PostgREST desde el
-- frontend (verificado: solo usa supabase-js para auth, nunca .from()).

ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classrooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classroom_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chapters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."levels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."course_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."labs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lab_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."assessment_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."xp_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."daily_quests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."daily_quest_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."achievement_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."leaderboard_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_spent_per_module" ENABLE ROW LEVEL SECURITY;
