import * as historialEstadoObraRepository from '../repositories/historialEstadoObra.repository.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarHistorialEstadoPorObra(supabase, obraId, filtros) {
  return historialEstadoObraRepository.listarHistorialEstadoPorObra(supabase, obraId, filtros);
}
