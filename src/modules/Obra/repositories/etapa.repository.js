import { manejarErrorPostgres } from '../../../utils/manejarErrorpostgres.js';

/**
 * @typedef {Object} Etapa
 * @property {string} id
 * @property {string} obraId
 * @property {string} nombre
 * @property {number} numero
 * @property {string} empresaEjecutora
 * @property {string} fechaInicioPlanificada
 * @property {string} fechaFinPlanificada
 * @property {number} porcentajeAvance
 * @property {number} presupuestoAsignado
 * @property {number} gastoReal
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * Calcula el próximo número de etapa disponible para una obra
 * (max(numero) + 1). La numeración es autoincremental y la
 * decide siempre el backend, nunca el body de la request.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @returns {Promise<number>}
 */
async function obtenerSiguienteNumeroEtapa(supabase, obraId) {
  const { data, error } = await supabase
    .from('etapa')
    .select('numero')
    .eq('obra_id', obraId)
    .order('numero', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.numero ?? 0) + 1;
}

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `etapa` (snake_case)
 * @returns {Etapa}
 */
function mapRowToEtapa(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    nombre: row.nombre,
    numero: row.numero,
    empresaEjecutora: row.empresa_ejecutora,
    fechaInicioPlanificada: row.fecha_inicio_planificada,
    fechaFinPlanificada: row.fecha_fin_planificada,
    porcentajeAvance: row.porcentaje_avance,
    presupuestoAsignado: row.presupuesto_asignado,
    gastoReal: row.gasto_real,
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
 * @returns {Promise<{ etapas: Etapa[], total: number }>}
 */
export async function listarEtapasPorObra(supabase, obraId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  const { data, error, count } = await supabase
    .from('etapa')
    .select('*', { count: 'exact' })
    .eq('obra_id', obraId)
    .range(desde, hasta);

  if (error) throw error;

  return { etapas: (data ?? []).map(mapRowToEtapa), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<Etapa>} datos
 * @param {string} usuarioAuthId - para completar creado_por
 * @returns {Promise<Etapa>}
 */
export async function crearEtapa(supabase, obraId, datos, usuarioAuthId) {
  const siguienteNumero = await obtenerSiguienteNumeroEtapa(supabase, obraId);

  const { data, error } = await supabase
    .from('etapa')
    .insert({
      obra_id: obraId,
      nombre: datos.nombre,
      numero: siguienteNumero,
      empresa_ejecutora: datos.empresaEjecutora,
      fecha_inicio_planificada: datos.fechaInicioPlanificada,
      fecha_fin_planificada: datos.fechaFinPlanificada,
      porcentaje_avance: datos.porcentajeAvance,
      presupuesto_asignado: datos.presupuestoAsignado,
      gasto_real: datos.gastoReal,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToEtapa(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @returns {Promise<Etapa | null>}
 */
export async function obtenerEtapaPorId(supabase, etapaId) {
  const { data, error } = await supabase.from('etapa').select('*').eq('id', etapaId).maybeSingle();
  if (error) throw error;
  return data ? mapRowToEtapa(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {Partial<Etapa>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<Etapa | null>}
 */
export async function actualizarEtapa(supabase, etapaId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  if (datos.empresaEjecutora !== undefined) cambios.empresa_ejecutora = datos.empresaEjecutora;
  if (datos.fechaInicioPlanificada !== undefined) cambios.fecha_inicio_planificada = datos.fechaInicioPlanificada;
  if (datos.fechaFinPlanificada !== undefined) cambios.fecha_fin_planificada = datos.fechaFinPlanificada;
  if (datos.porcentajeAvance !== undefined) cambios.porcentaje_avance = datos.porcentajeAvance;
  if (datos.presupuestoAsignado !== undefined) cambios.presupuesto_asignado = datos.presupuestoAsignado;
  if (datos.gastoReal !== undefined) cambios.gasto_real = datos.gastoReal;

  const { data, error } = await supabase.from('etapa').update(cambios).eq('id', etapaId).select('*').maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToEtapa(data) : null;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @returns {Promise<boolean>} true si había una fila y se borró
 */
export async function eliminarEtapa(supabase, etapaId) {
  const { data, error } = await supabase.from('etapa').delete().eq('id', etapaId).select('id').maybeSingle();
  if (error) throw error;
  return data !== null;
}
