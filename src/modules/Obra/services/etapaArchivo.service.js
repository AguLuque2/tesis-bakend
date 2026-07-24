import * as etapaArchivoRepository from '../repositories/etapaArchivo.repository.js';
import { NotFoundError } from '../../../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {{ page: number, pageSize: number }} filtros
 */
export async function listarEtapaArchivosPorEtapa(supabase, etapaId, filtros) {
  return etapaArchivoRepository.listarEtapaArchivosPorEtapa(supabase, etapaId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaArchivoId
 */
export async function obtenerEtapaArchivo(supabase, etapaArchivoId) {
  const archivo = await etapaArchivoRepository.obtenerEtapaArchivoPorId(supabase, etapaArchivoId);
  if (!archivo) {
    throw new NotFoundError('No se encontró el archivo de etapa solicitado');
  }
  return archivo;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaId
 * @param {Partial<import('../repositories/etapaArchivo.repository.js').EtapaArchivo>} datos
 * @param {string} usuarioAuthId
 */
export async function crearEtapaArchivo(supabase, etapaId, datos, usuarioAuthId) {
  return etapaArchivoRepository.crearEtapaArchivo(supabase, etapaId, datos, usuarioAuthId);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaArchivoId
 * @param {Partial<import('../repositories/etapaArchivo.repository.js').EtapaArchivo>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarEtapaArchivo(supabase, etapaArchivoId, datos, usuarioAuthId) {
  const archivoActualizado = await etapaArchivoRepository.actualizarEtapaArchivo(
    supabase,
    etapaArchivoId,
    datos,
    usuarioAuthId,
  );
  if (!archivoActualizado) {
    throw new NotFoundError('No se encontró el archivo de etapa a actualizar');
  }
  return archivoActualizado;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} etapaArchivoId
 */
export async function eliminarEtapaArchivo(supabase, etapaArchivoId) {
  const eliminado = await etapaArchivoRepository.eliminarEtapaArchivo(supabase, etapaArchivoId);
  if (!eliminado) {
    throw new NotFoundError('No se encontró el archivo de etapa a eliminar');
  }
}
