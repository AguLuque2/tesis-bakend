import { manejarErrorPostgres } from '../../../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} ItemObra
 * @property {string} id
 * @property {string} obraId
 * @property {string} tramo
 * @property {string} nroItem
 * @property {string} descripcion
 * @property {string} unidad
 * @property {number} precioUnitario
 * @property {number} cantidadContratada
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `item_obra` (snake_case)
 * @returns {ItemObra}
 */
function mapRowToItemObra(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    tramo: row.tramo,
    nroItem: row.nro_item,
    descripcion: row.descripcion,
    unidad: row.unidad,
    precioUnitario: row.precio_unitario,
    cantidadContratada: row.cantidad_contratada,
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
 * @returns {Promise<{ items: ItemObra[], total: number }>}
 */
export async function listarItemsObraPorObra(supabase, obraId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  const { data, error, count } = await supabase
    .from('item_obra')
    .select('*', { count: 'exact' })
    .eq('obra_id', obraId)
    .range(desde, hasta);

  if (error) throw error;

  return { items: (data ?? []).map(mapRowToItemObra), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<ItemObra>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<ItemObra>}
 */
export async function crearItemObra(supabase, obraId, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('item_obra')
    .insert({
      obra_id: obraId,
      tramo: datos.tramo,
      nro_item: datos.nroItem,
      descripcion: datos.descripcion,
      unidad: datos.unidad,
      precio_unitario: datos.precioUnitario,
      cantidad_contratada: datos.cantidadContratada,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToItemObra(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} itemObraId
 * @returns {Promise<ItemObra | null>}
 */
export async function obtenerItemObraPorId(supabase, itemObraId) {
  const { data, error } = await supabase.from('item_obra').select('*').eq('id', itemObraId).maybeSingle();
  if (error) throw error;
  return data ? mapRowToItemObra(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} itemObraId
 * @param {Partial<ItemObra>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<ItemObra | null>}
 */
export async function actualizarItemObra(supabase, itemObraId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.tramo !== undefined) cambios.tramo = datos.tramo;
  if (datos.nroItem !== undefined) cambios.nro_item = datos.nroItem;
  if (datos.descripcion !== undefined) cambios.descripcion = datos.descripcion;
  if (datos.unidad !== undefined) cambios.unidad = datos.unidad;
  if (datos.precioUnitario !== undefined) cambios.precio_unitario = datos.precioUnitario;
  if (datos.cantidadContratada !== undefined) cambios.cantidad_contratada = datos.cantidadContratada;

  const { data, error } = await supabase
    .from('item_obra')
    .update(cambios)
    .eq('id', itemObraId)
    .select('*')
    .maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToItemObra(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} itemObraId
 * @returns {Promise<boolean>} true si había una fila y se borró
 */
export async function eliminarItemObra(supabase, itemObraId) {
  const { data, error } = await supabase.from('item_obra').delete().eq('id', itemObraId).select('id').maybeSingle();
  if (error) throw error;
  return data !== null;
}
