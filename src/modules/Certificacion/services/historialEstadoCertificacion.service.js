import * as historialEstadoCertificacionRepository from '../repositories/historialEstadoCertificacion.repository.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarHistorialEstadoPorCertificacion(supabase, certificacionId, filtros) {
  return historialEstadoCertificacionRepository.listarHistorialEstadoPorCertificacion(supabase, certificacionId, filtros);
}
