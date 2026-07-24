import { manejarErrorPostgres } from '../../../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} Obra
 * @property {string} id
 * @property {string} codigo
 * @property {string} nombre
 * @property {string} cliente
 * @property {string} tipoObra
 * @property {string} ubicacion
 * @property {string} estado
 * @property {string} fechaInicioPlanificada
 * @property {string} fechaFinPlanificada
 * @property {string} responsable
 * @property {string} descripcion
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `obra` (snake_case)
 * @returns {Obra}
 */
function mapRowToObra(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    cliente: row.cliente,
    tipoObra: row.tipo_obra,
    ubicacion: row.ubicacion,
    estado: row.estado,
    fechaInicioPlanificada: row.fecha_inicio_planificada,
    fechaFinPlanificada: row.fecha_fin_planificada,
    responsable: row.responsable,
    descripcion: row.descripcion,
    creadoEn: row.creado_en,
    creadoPor: row.creado_por,
    actualizadoEn: row.actualizado_en,
    actualizadoPor: row.actualizado_por,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ estado?: string, page: number, pageSize: number }} filtros
 * @returns {Promise<{ obras: Obra[], total: number }>}
 */
export async function listarObras(supabase, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  let query = supabase.from('obra').select('*', { count: 'exact' }).range(desde, hasta);

  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { obras: (data ?? []).map(mapRowToObra), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @returns {Promise<Obra | null>}
 */
export async function obtenerObraPorId(supabase, obraId) {
  const { data, error } = await supabase.from('obra').select('*').eq('id', obraId).maybeSingle();
  if (error) throw error;
  return data ? mapRowToObra(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Partial<Obra>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<Obra>}
 */
export async function crearObra(supabase, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('obra')
    .insert({
      codigo: datos.codigo,
      nombre: datos.nombre,
      cliente: datos.cliente,
      tipo_obra: datos.tipoObra,
      ubicacion: datos.ubicacion,
      fecha_inicio_planificada: datos.fechaInicioPlanificada,
      fecha_fin_planificada: datos.fechaFinPlanificada,
      responsable: datos.responsable,
      descripcion: datos.descripcion,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToObra(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<Obra>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<Obra | null>}
 */
export async function actualizarObra(supabase, obraId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.codigo !== undefined) cambios.codigo = datos.codigo;
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  if (datos.cliente !== undefined) cambios.cliente = datos.cliente;
  if (datos.tipoObra !== undefined) cambios.tipo_obra = datos.tipoObra;
  if (datos.ubicacion !== undefined) cambios.ubicacion = datos.ubicacion;
  if (datos.fechaInicioPlanificada !== undefined) cambios.fecha_inicio_planificada = datos.fechaInicioPlanificada;
  if (datos.fechaFinPlanificada !== undefined) cambios.fecha_fin_planificada = datos.fechaFinPlanificada;
  if (datos.responsable !== undefined) cambios.responsable = datos.responsable;
  if (datos.descripcion !== undefined) cambios.descripcion = datos.descripcion;

  const { data, error } = await supabase.from('obra').update(cambios).eq('id', obraId).select('*').maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToObra(data) : null;
}
