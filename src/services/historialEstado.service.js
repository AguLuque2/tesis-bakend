import * as historialEstadoRepository from '../repositories/historialEstado.repository.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarHistorialEstadoPorObra(supabase, obraId, filtros) {
  return historialEstadoRepository.listarHistorialEstadoPorObra(supabase, obraId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarHistorialEstadoPorCertificacion(supabase, certificacionId, filtros) {
  return historialEstadoRepository.listarHistorialEstadoPorCertificacion(supabase, certificacionId, filtros);
}
