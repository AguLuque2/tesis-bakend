import { manejarErrorPostgres } from '../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} EtapaArchivo
 * @property {string} id
 * @property {string} etapaId
 * @property {string} tipo
 * @property {string} nombreArchivo
 * @property {string} archivo
 * @property {string} fechaSubida
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `etapa_archivo` (snake_case)
 * @returns {EtapaArchivo}
 */
function mapRowToEtapaArchivo(row) {
  return {
    id: row.id,
    etapaId: row.etapa_id,
    tipo: row.tipo,
    nombreArchivo: row.nombre_archivo,
    archivo: row.archivo,
    fechaSubida: row.fecha_subida,
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
 * @returns {Promise<{ archivos: EtapaArchivo[], total: number }>}
 */
export async function listarEtapaArchivosPorEtapa(supabase, etapaId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  const { data, error, count } = await supabase
    .from('etapa_archivo')
    .select('*', { count: 'exact' })
    .eq('etapa_id', etapaId)
    .range(desde, hasta);

  if (error) throw error;

  return { archivos: (data ?? []).map(mapRowToEtapaArchivo), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaArchivoId
 * @returns {Promise<EtapaArchivo | null>}
 */
export async function obtenerEtapaArchivoPorId(supabase, etapaArchivoId) {
  const { data, error } = await supabase
    .from('etapa_archivo')
    .select('*')
    .eq('id', etapaArchivoId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToEtapaArchivo(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {Partial<EtapaArchivo>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<EtapaArchivo>}
 */
export async function crearEtapaArchivo(supabase, etapaId, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('etapa_archivo')
    .insert({
      etapa_id: etapaId,
      tipo: datos.tipo,
      nombre_archivo: datos.nombreArchivo,
      archivo: datos.archivo,
      fecha_subida: datos.fechaSubida,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToEtapaArchivo(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaArchivoId
 * @param {Partial<EtapaArchivo>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<EtapaArchivo | null>}
 */
export async function actualizarEtapaArchivo(supabase, etapaArchivoId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.tipo !== undefined) cambios.tipo = datos.tipo;
  if (datos.nombreArchivo !== undefined) cambios.nombre_archivo = datos.nombreArchivo;
  if (datos.archivo !== undefined) cambios.archivo = datos.archivo;
  if (datos.fechaSubida !== undefined) cambios.fecha_subida = datos.fechaSubida;

  const { data, error } = await supabase
    .from('etapa_archivo')
    .update(cambios)
    .eq('id', etapaArchivoId)
    .select('*')
    .maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToEtapaArchivo(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaArchivoId
 * @returns {Promise<boolean>} true si había una fila y se borró
 */
export async function eliminarEtapaArchivo(supabase, etapaArchivoId) {
  const { data, error } = await supabase
    .from('etapa_archivo')
    .delete()
    .eq('id', etapaArchivoId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
