import { manejarErrorPostgres } from '../../../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} CertificacionItem
 * @property {string} id
 * @property {string} certificacionId
 * @property {string} itemObraId
 * @property {number} cantidadAnterior
 * @property {number} cantidadPresente
 * @property {number} cantidadAcumulada
 * @property {number} porcentajeAnterior
 * @property {number} porcentajePresente
 * @property {number} porcentajeAcumulado
 * @property {number} montoAnterior
 * @property {number} montoPresente
 * @property {number} montoAcumulado
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `certificacion_item` (snake_case)
 * @returns {CertificacionItem}
 */
function mapRowToCertificacionItem(row) {
  return {
    id: row.id,
    certificacionId: row.certificacion_id,
    itemObraId: row.item_obra_id,
    cantidadAnterior: row.cantidad_anterior,
    cantidadPresente: row.cantidad_presente,
    cantidadAcumulada: row.cantidad_acumulada,
    porcentajeAnterior: row.porcentaje_anterior,
    porcentajePresente: row.porcentaje_presente,
    porcentajeAcumulado: row.porcentaje_acumulado,
    montoAnterior: row.monto_anterior,
    montoPresente: row.monto_presente,
    montoAcumulado: row.monto_acumulado,
    creadoEn: row.creado_en,
    creadoPor: row.creado_por,
    actualizadoEn: row.actualizado_en,
    actualizadoPor: row.actualizado_por,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {{ page: number, pageSize: number }} filtros
 * @returns {Promise<{ items: CertificacionItem[], total: number }>}
 */
export async function listarCertificacionItemsPorCertificacion(supabase, certificacionId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  const { data, error, count } = await supabase
    .from('certificacion_item')
    .select('*', { count: 'exact' })
    .eq('certificacion_id', certificacionId)
    .range(desde, hasta);

  if (error) throw error;

  return { items: (data ?? []).map(mapRowToCertificacionItem), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionItemId
 * @returns {Promise<CertificacionItem | null>}
 */
export async function obtenerCertificacionItemPorId(supabase, certificacionItemId) {
  const { data, error } = await supabase
    .from('certificacion_item')
    .select('*')
    .eq('id', certificacionItemId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToCertificacionItem(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {Partial<CertificacionItem>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<CertificacionItem>}
 */
export async function crearCertificacionItem(supabase, certificacionId, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('certificacion_item')
    .insert({
      certificacion_id: certificacionId,
      item_obra_id: datos.itemObraId,
      cantidad_anterior: datos.cantidadAnterior,
      cantidad_presente: datos.cantidadPresente,
      cantidad_acumulada: datos.cantidadAcumulada,
      porcentaje_anterior: datos.porcentajeAnterior,
      porcentaje_presente: datos.porcentajePresente,
      porcentaje_acumulado: datos.porcentajeAcumulado,
      monto_anterior: datos.montoAnterior,
      monto_presente: datos.montoPresente,
      monto_acumulado: datos.montoAcumulado,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToCertificacionItem(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionItemId
 * @param {Partial<CertificacionItem>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<CertificacionItem | null>}
 */
export async function actualizarCertificacionItem(supabase, certificacionItemId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.itemObraId !== undefined) cambios.item_obra_id = datos.itemObraId;
  if (datos.cantidadAnterior !== undefined) cambios.cantidad_anterior = datos.cantidadAnterior;
  if (datos.cantidadPresente !== undefined) cambios.cantidad_presente = datos.cantidadPresente;
  if (datos.cantidadAcumulada !== undefined) cambios.cantidad_acumulada = datos.cantidadAcumulada;
  if (datos.porcentajeAnterior !== undefined) cambios.porcentaje_anterior = datos.porcentajeAnterior;
  if (datos.porcentajePresente !== undefined) cambios.porcentaje_presente = datos.porcentajePresente;
  if (datos.porcentajeAcumulado !== undefined) cambios.porcentaje_acumulado = datos.porcentajeAcumulado;
  if (datos.montoAnterior !== undefined) cambios.monto_anterior = datos.montoAnterior;
  if (datos.montoPresente !== undefined) cambios.monto_presente = datos.montoPresente;
  if (datos.montoAcumulado !== undefined) cambios.monto_acumulado = datos.montoAcumulado;

  const { data, error } = await supabase
    .from('certificacion_item')
    .update(cambios)
    .eq('id', certificacionItemId)
    .select('*')
    .maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToCertificacionItem(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionItemId
 * @returns {Promise<boolean>} true si había una fila y se borró
 */
export async function eliminarCertificacionItem(supabase, certificacionItemId) {
  const { data, error } = await supabase
    .from('certificacion_item')
    .delete()
    .eq('id', certificacionItemId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
