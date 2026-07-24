import * as obraRepository from '../repositories/obra.repository.js';
import { NotFoundError } from '../../../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ estado?: string, page: number, pageSize: number }} filtros
 */
export async function listarObras(supabase, filtros) {
  return obraRepository.listarObras(supabase, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 */
export async function obtenerObra(supabase, obraId) {
  const obra = await obraRepository.obtenerObraPorId(supabase, obraId);
  if (!obra) {
    throw new NotFoundError('No se encontró la obra solicitada');
  }
  return obra;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {Partial<import('../repositories/obra.repository.js').Obra>} datos
 * @param {string} usuarioAuthId
 */
export async function crearObra(supabase, datos, usuarioAuthId) {
  // Acá es donde iría cualquier regla de negocio propia de "crear una obra"
  // (ej: generar código automático, validaciones cruzadas, etc.)
  return obraRepository.crearObra(supabase, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<import('../repositories/obra.repository.js').Obra>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarObra(supabase, obraId, datos, usuarioAuthId) {
  const obraActualizada = await obraRepository.actualizarObra(supabase, obraId, datos, usuarioAuthId);
  if (!obraActualizada) {
    throw new NotFoundError('No se encontró la obra a actualizar');
  }
  return obraActualizada;
}
