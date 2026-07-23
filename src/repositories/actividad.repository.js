import { manejarErrorPostgres } from '../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} Actividad
 * @property {string} id
 * @property {string} etapaId
 * @property {string} tipoActividadId
 * @property {string} identificador
 * @property {string} fecha
 * @property {string} estado
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `actividad` (snake_case)
 * @returns {Actividad}
 */
function mapRowToActividad(row) {
  return {
    id: row.id,
    etapaId: row.etapa_id,
    tipoActividadId: row.tipo_actividad_id,
    identificador: row.identificador,
    fecha: row.fecha,
    estado: row.estado,
    creadoEn: row.creado_en,
    creadoPor: row.creado_por,
    actualizadoEn: row.actualizado_en,
    actualizadoPor: row.actualizado_por,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {{ page: number, pageSize: number }} filtros
 * @returns {Promise<{ actividades: Actividad[], total: number }>}
 */
export async function listarActividadesPorEtapa(supabase, etapaId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  const { data, error, count } = await supabase
    .from('actividad')
    .select('*', { count: 'exact' })
    .eq('etapa_id', etapaId)
    .range(desde, hasta);

  if (error) throw error;

  return { actividades: (data ?? []).map(mapRowToActividad), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actividadId
 * @returns {Promise<Actividad | null>}
 */
export async function obtenerActividadPorId(supabase, actividadId) {
  const { data, error } = await supabase.from('actividad').select('*').eq('id', actividadId).maybeSingle();
  if (error) throw error;
  return data ? mapRowToActividad(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {Partial<Actividad>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<Actividad>}
 */
export async function crearActividad(supabase, etapaId, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('actividad')
    .insert({
      etapa_id: etapaId,
      tipo_actividad_id: datos.tipoActividadId,
      identificador: datos.identificador,
      fecha: datos.fecha,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToActividad(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actividadId
 * @param {Partial<Actividad>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<Actividad | null>}
 */
export async function actualizarActividad(supabase, actividadId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.tipoActividadId !== undefined) cambios.tipo_actividad_id = datos.tipoActividadId;
  if (datos.identificador !== undefined) cambios.identificador = datos.identificador;
  if (datos.fecha !== undefined) cambios.fecha = datos.fecha;
  if (datos.estado !== undefined) cambios.estado = datos.estado;

  const { data, error } = await supabase
    .from('actividad')
    .update(cambios)
    .eq('id', actividadId)
    .select('*')
    .maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToActividad(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actividadId
 * @returns {Promise<boolean>} true si había una fila y se borró
 */
export async function eliminarActividad(supabase, actividadId) {
  const { data, error } = await supabase.from('actividad').delete().eq('id', actividadId).select('id').maybeSingle();
  if (error) throw error;
  return data !== null;
}
