-- =========================================================
-- Unicidad de etapa dentro de una obra
-- Bug detectado: el backend permitía crear dos etapas con el
-- mismo número o el mismo nombre para la misma obra, porque
-- la tabla no tenía ninguna restricción que lo impidiera.
-- La numeración pasa a ser autoincremental por obra (la
-- calcula el backend, ver etapa.repository.js), pero el
-- unique acá es la garantía real ante condiciones de carrera
-- (dos requests de alta simultáneas para la misma obra).
-- =========================================================

alter table etapa add constraint etapa_obra_id_numero_key unique (obra_id, numero);
alter table etapa add constraint etapa_obra_id_nombre_key unique (obra_id, nombre);
