/**
 * @typedef {Object} HistorialEstadoObra
 * @property {string} id
 * @property {string} obraId
 * @property {string | null} estadoAnterior
 * @property {string} estadoNuevo
 * @property {string} fecha
 * @property {string | null} cambiadoPor
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de `historial_estado_obra` (snake_case)
 * @returns {HistorialEstadoObra}
 */
function mapRowToHistorialEstadoObra(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    estadoAnterior: row.estado_anterior,
    estadoNuevo: row.estado_nuevo,
    fecha: row.fecha,
    cambiadoPor: row.cambiado_por,
    creadoEn: row.creado_en,
    creadoPor: row.creado_por,
    actualizadoEn: row.actualizado_en,
    actualizadoPor: row.actualizado_por,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ page: number, pageSize: number }} filtros
 * @returns {Promise<{ historial: HistorialEstadoObra[], total: number }>}
 */
export async function listarHistorialEstadoPorObra(supabase, obraId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  const { data, error, count } = await supabase
    .from('historial_estado_obra')
    .select('*', { count: 'exact' })
    .eq('obra_id', obraId)
    .order('fecha', { ascending: false })
    .range(desde, hasta);

  if (error) throw error;

  return { historial: (data ?? []).map(mapRowToHistorialEstadoObra), total: count ?? 0 };
}
