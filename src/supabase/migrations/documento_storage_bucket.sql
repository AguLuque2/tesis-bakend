-- =========================================================
-- Bucket de Storage para los archivos de la tabla `documento`
-- (lista de documentación de una obra).
--
-- Privado a propósito: nadie accede por URL pública ni por
-- políticas de storage.objects para usuarios comunes. Todo el
-- acceso pasa por el backend, que usa la service_role key
-- (supabaseAdmin, bypasea RLS igual que en las tablas de
-- public) para subir el archivo y para generar URLs firmadas
-- de descarga con expiración corta. La autorización real pasa
-- por la fila de `documento` (RLS ya la protege en
-- 006_rls_policies.sql) — si el usuario puede ver esa fila,
-- el backend le genera la URL firmada; si no, ni siquiera
-- llega a pedirla.
--
-- Si el insert de acá falla en tu entorno (permisos del rol
-- con el que corrés el SQL editor), creá el bucket a mano
-- desde Supabase Studio → Storage → New bucket → nombre
-- "documentos" → Private.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;
