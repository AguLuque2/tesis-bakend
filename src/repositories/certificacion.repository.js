import { manejarErrorPostgres } from '../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} Certificacion
 * @property {string} id
 * @property {string} obraId
 * @property {string} numero
 * @property {string} periodoDesde
 * @property {string} periodoHasta
 * @property {string} fechaEmision
 * @property {string} estado
 * @property {number} montoBrutoCertificado
 * @property {number} porcentajeAvanceMes
 * @property {number} montoAcumulado
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `certificacion` (snake_case)
 * @returns {Certificacion}
 */
function mapRowToCertificacion(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    numero: row.numero,
    periodoDesde: row.periodo_desde,
    periodoHasta: row.periodo_hasta,
    fechaEmision: row.fecha_emision,
    estado: row.estado,
    montoBrutoCertificado: row.monto_bruto_certificado,
    porcentajeAvanceMes: row.porcentaje_avance_mes,
    montoAcumulado: row.monto_acumulado,
    creadoEn: row.creado_en,
    creadoPor: row.creado_por,
    actualizadoEn: row.actualizado_en,
    actualizadoPor: row.actualizado_por,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ estado?: string, page: number, pageSize: number }} filtros
 * @returns {Promise<{ certificaciones: Certificacion[], total: number }>}
 */
export async function listarCertificacionesPorObra(supabase, obraId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  let query = supabase
    .from('certificacion')
    .select('*', { count: 'exact' })
    .eq('obra_id', obraId)
    .range(desde, hasta);

  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { certificaciones: (data ?? []).map(mapRowToCertificacion), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @returns {Promise<Certificacion | null>}
 */
export async function obtenerCertificacionPorId(supabase, certificacionId) {
  const { data, error } = await supabase.from('certificacion').select('*').eq('id', certificacionId).maybeSingle();
  if (error) throw error;
  return data ? mapRowToCertificacion(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<Certificacion>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<Certificacion>}
 */
export async function crearCertificacion(supabase, obraId, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('certificacion')
    .insert({
      obra_id: obraId,
      numero: datos.numero,
      periodo_desde: datos.periodoDesde,
      periodo_hasta: datos.periodoHasta,
      fecha_emision: datos.fechaEmision,
      estado: 'borrador',
      monto_bruto_certificado: datos.montoBrutoCertificado,
      porcentaje_avance_mes: datos.porcentajeAvanceMes,
      monto_acumulado: datos.montoAcumulado,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToCertificacion(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {Partial<Certificacion>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<Certificacion | null>}
 */
export async function actualizarCertificacion(supabase, certificacionId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.numero !== undefined) cambios.numero = datos.numero;
  if (datos.periodoDesde !== undefined) cambios.periodo_desde = datos.periodoDesde;
  if (datos.periodoHasta !== undefined) cambios.periodo_hasta = datos.periodoHasta;
  if (datos.fechaEmision !== undefined) cambios.fecha_emision = datos.fechaEmision;
  if (datos.montoBrutoCertificado !== undefined) cambios.monto_bruto_certificado = datos.montoBrutoCertificado;
  if (datos.porcentajeAvanceMes !== undefined) cambios.porcentaje_avance_mes = datos.porcentajeAvanceMes;
  if (datos.montoAcumulado !== undefined) cambios.monto_acumulado = datos.montoAcumulado;

  const { data, error } = await supabase
    .from('certificacion')
    .update(cambios)
    .eq('id', certificacionId)
    .select('*')
    .maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToCertificacion(data) : null;
}