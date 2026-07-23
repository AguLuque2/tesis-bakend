import * as actividadRepository from '../repositories/actividad.repository.js';
import { NotFoundError } from '../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarActividadesPorEtapa(supabase, etapaId, filtros) {
  return actividadRepository.listarActividadesPorEtapa(supabase, etapaId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actividadId
 */
export async function obtenerActividad(supabase, actividadId) {
  const actividad = await actividadRepository.obtenerActividadPorId(supabase, actividadId);
  if (!actividad) {
    throw new NotFoundError('No se encontró la actividad solicitada');
  }
  return actividad;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {Partial<import('../repositories/actividad.repository.js').Actividad>} datos
 * @param {string} usuarioAuthId
 */
export async function crearActividad(supabase, etapaId, datos, usuarioAuthId) {
  return actividadRepository.crearActividad(supabase, etapaId, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actividadId
 * @param {Partial<import('../repositories/actividad.repository.js').Actividad>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarActividad(supabase, actividadId, datos, usuarioAuthId) {
  const actividadActualizada = await actividadRepository.actualizarActividad(
    supabase,
    actividadId,
    datos,
    usuarioAuthId,
  );
  if (!actividadActualizada) {
    throw new NotFoundError('No se encontró la actividad a actualizar');
  }
  return actividadActualizada;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} actividadId
 */
export async function eliminarActividad(supabase, actividadId) {
  const eliminada = await actividadRepository.eliminarActividad(supabase, actividadId);
  if (!eliminada) {
    throw new NotFoundError('No se encontró la actividad a eliminar');
  }
}
