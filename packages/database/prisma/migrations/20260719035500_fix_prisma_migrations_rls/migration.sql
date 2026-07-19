-- La migración anterior (enable_row_level_security) habilitó RLS también en
-- _prisma_migrations, la tabla interna de bookkeeping de Prisma. Eso rompe
-- `prisma migrate dev`: su base de datos shadow necesita acceso sin
-- restricciones a esa tabla para reproducir el historial de migraciones
-- (falla con "relation public._prisma_migrations does not exist" al
-- reconstruir el shadow db). _prisma_migrations no tiene datos de usuario ni
-- nada sensible (solo nombres de archivo, checksums y timestamps de
-- migraciones) — el riesgo real de dejarla sin RLS es prácticamente nulo, a
-- diferencia de las 19 tablas de la aplicación, que mantienen RLS habilitado.
ALTER TABLE "public"."_prisma_migrations" DISABLE ROW LEVEL SECURITY;
