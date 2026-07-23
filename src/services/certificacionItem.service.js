import * as certificacionItemRepository from '../repositories/certificacionItem.repository.js';
import { NotFoundError } from '../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarCertificacionItemsPorCertificacion(supabase, certificacionId, filtros) {
  return certificacionItemRepository.listarCertificacionItemsPorCertificacion(supabase, certificacionId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionItemId
 */
export async function obtenerCertificacionItem(supabase, certificacionItemId) {
  const item = await certificacionItemRepository.obtenerCertificacionItemPorId(supabase, certificacionItemId);
  if (!item) {
    throw new NotFoundError('No se encontró el ítem de certificación solicitado');
  }
  return item;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {Partial<import('../repositories/certificacionItem.repository.js').CertificacionItem>} datos
 * @param {string} usuarioAuthId
 */
export async function crearCertificacionItem(supabase, certificacionId, datos, usuarioAuthId) {
  return certificacionItemRepository.crearCertificacionItem(supabase, certificacionId, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionItemId
 * @param {Partial<import('../repositories/certificacionItem.repository.js').CertificacionItem>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarCertificacionItem(supabase, certificacionItemId, datos, usuarioAuthId) {
  const itemActualizado = await certificacionItemRepository.actualizarCertificacionItem(
    supabase,
    certificacionItemId,
    datos,
    usuarioAuthId,
  );
  if (!itemActualizado) {
    throw new NotFoundError('No se encontró el ítem de certificación a actualizar');
  }
  return itemActualizado;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionItemId
 */
export async function eliminarCertificacionItem(supabase, certificacionItemId) {
  const eliminado = await certificacionItemRepository.eliminarCertificacionItem(supabase, certificacionItemId);
  if (!eliminado) {
    throw new NotFoundError('No se encontró el ítem de certificación a eliminar');
  }
}
