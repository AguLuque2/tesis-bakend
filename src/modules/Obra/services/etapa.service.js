import * as etapaRepository from '../repositories/etapa.repository.js';
import { NotFoundError } from '../../../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarEtapasPorObra(supabase, obraId, filtros) {
  return etapaRepository.listarEtapasPorObra(supabase, obraId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<import('../repositories/etapa.repository.js').Etapa>} datos
 * @param {string} usuarioAuthId
 */
export async function crearEtapa(supabase, obraId, datos, usuarioAuthId) {
  return etapaRepository.crearEtapa(supabase, obraId, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 */
export async function obtenerEtapa(supabase, etapaId) {
  const etapa = await etapaRepository.obtenerEtapaPorId(supabase, etapaId);
  if (!etapa) {
    throw new NotFoundError('No se encontró la etapa solicitada');
  }
  return etapa;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {Partial<import('../repositories/etapa.repository.js').Etapa>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarEtapa(supabase, etapaId, datos, usuarioAuthId) {
  const etapaActualizada = await etapaRepository.actualizarEtapa(supabase, etapaId, datos, usuarioAuthId);
  if (!etapaActualizada) {
    throw new NotFoundError('No se encontró la etapa a actualizar');
  }
  return etapaActualizada;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 */
export async function eliminarEtapa(supabase, etapaId) {
  const eliminada = await etapaRepository.eliminarEtapa(supabase, etapaId);
  if (!eliminada) {
    throw new NotFoundError('No se encontró la etapa a eliminar');
  }
}
