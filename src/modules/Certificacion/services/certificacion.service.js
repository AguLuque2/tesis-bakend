import * as certificacionRepository from '../repositories/certificacion.repository.js';
import { NotFoundError } from '../../../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ estado?: string, page: number, pageSize: number }} filtros
 */
export async function listarCertificacionesPorObra(supabase, obraId, filtros) {
  return certificacionRepository.listarCertificacionesPorObra(supabase, obraId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 */
export async function obtenerCertificacion(supabase, certificacionId) {
  const certificacion = await certificacionRepository.obtenerCertificacionPorId(supabase, certificacionId);
  if (!certificacion) {
    throw new NotFoundError('No se encontró la certificación solicitada');
  }
  return certificacion;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<import('../repositories/certificacion.repository.js').Certificacion>} datos
 * @param {string} usuarioAuthId
 */
export async function crearCertificacion(supabase, obraId, datos, usuarioAuthId) {
  // La certificación siempre arranca en estado "borrador" (ver tabla en 002_tables.sql);
  // el cambio a los siguientes estados del flujo se maneja en otro endpoint.
  return certificacionRepository.crearCertificacion(supabase, obraId, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} certificacionId
 * @param {Partial<import('../repositories/certificacion.repository.js').Certificacion>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarCertificacion(supabase, certificacionId, datos, usuarioAuthId) {
  const certificacionActualizada = await certificacionRepository.actualizarCertificacion(
    supabase,
    certificacionId,
    datos,
    usuarioAuthId,
  );
  if (!certificacionActualizada) {
    throw new NotFoundError('No se encontró la certificación a actualizar');
  }
  return certificacionActualizada;
}