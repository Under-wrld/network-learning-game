-- Escrita a mano y aplicada vía `prisma migrate deploy` (no `migrate dev`):
-- el historial de migraciones ya tiene una migración que altera
-- _prisma_migrations (enable_row_level_security), y replayearla en la base
-- shadow de `migrate dev` falla siempre con "relation public._prisma_migrations
-- does not exist" — la shadow db no materializa esa tabla salvo que una
-- migración la referencie, y en ese punto de la reproducción todavía no
-- existe. Ver DECISIONS.md: de acá en más, todo cambio de schema se escribe
-- a mano y se aplica con `migrate deploy`, que no depende de la shadow db.
ALTER TABLE "public"."levels" ADD COLUMN "content" JSONB;
