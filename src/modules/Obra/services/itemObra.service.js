import * as itemObraRepository from '../repositories/itemObra.repository.js';
import { NotFoundError } from '../../../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarItemsObraPorObra(supabase, obraId, filtros) {
  return itemObraRepository.listarItemsObraPorObra(supabase, obraId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<import('../repositories/itemObra.repository.js').ItemObra>} datos
 * @param {string} usuarioAuthId
 */
export async function crearItemObra(supabase, obraId, datos, usuarioAuthId) {
  return itemObraRepository.crearItemObra(supabase, obraId, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} itemObraId
 */
export async function obtenerItemObra(supabase, itemObraId) {
  const item = await itemObraRepository.obtenerItemObraPorId(supabase, itemObraId);
  if (!item) {
    throw new NotFoundError('No se encontró el ítem de obra solicitado');
  }
  return item;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} itemObraId
 * @param {Partial<import('../repositories/itemObra.repository.js').ItemObra>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarItemObra(supabase, itemObraId, datos, usuarioAuthId) {
  const itemActualizado = await itemObraRepository.actualizarItemObra(supabase, itemObraId, datos, usuarioAuthId);
  if (!itemActualizado) {
    throw new NotFoundError('No se encontró el ítem de obra a actualizar');
  }
  return itemActualizado;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} itemObraId
 */
export async function eliminarItemObra(supabase, itemObraId) {
  const eliminado = await itemObraRepository.eliminarItemObra(supabase, itemObraId);
  if (!eliminado) {
    throw new NotFoundError('No se encontró el ítem de obra a eliminar');
  }
}
