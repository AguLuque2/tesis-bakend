import * as documentoRepository from '../repositories/documento.repository.js';
import { NotFoundError } from '../../../errors/AppError.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ estado?: string, page: number, pageSize: number }} filtros
 */
export async function listarDocumentosPorObra(supabase, obraId, filtros) {
  return documentoRepository.listarDocumentosPorObra(supabase, obraId, filtros);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 */
export async function obtenerDocumento(supabase, documentoId) {
  const documento = await documentoRepository.obtenerDocumentoPorId(supabase, documentoId);
  if (!documento) {
    throw new NotFoundError('No se encontró el documento solicitado');
  }
  return documento;
}

/**
 * Sube el archivo a Storage y recién después crea la fila en `documento`.
 * Si la fila falla (ej. obra_id inválido), borra el archivo ya subido
 * para no dejar objetos huérfanos en el bucket.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ nombre?: string, categoria?: string, fechaSubida?: string }} datos
 * @param {{ buffer: Buffer, originalname: string, mimetype: string, size: number }} archivo - `req.file` de multer
 * @param {string} usuarioAuthId
 */
export async function crearDocumento(supabase, obraId, datos, archivo, usuarioAuthId) {
  const rutaStorage = await documentoRepository.subirArchivoDocumento(obraId, archivo);

  try {
    return await documentoRepository.crearDocumento(
      supabase,
      obraId,
      {
        nombre: datos.nombre ?? archivo.originalname,
        categoria: datos.categoria,
        tipoArchivo: archivo.mimetype,
        tamano: String(archivo.size),
        archivo: rutaStorage,
        fechaSubida: datos.fechaSubida,
      },
      usuarioAuthId,
    );
  } catch (error) {
    await documentoRepository.eliminarArchivoDocumentoStorage(rutaStorage);
    throw error;
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 * @param {Partial<import('../repositories/documento.repository.js').Documento>} datos
 * @param {string} usuarioAuthId
 */
export async function actualizarDocumento(supabase, documentoId, datos, usuarioAuthId) {
  const documentoActualizado = await documentoRepository.actualizarDocumento(
    supabase,
    documentoId,
    datos,
    usuarioAuthId,
  );
  if (!documentoActualizado) {
    throw new NotFoundError('No se encontró el documento a actualizar');
  }
  return documentoActualizado;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 */
export async function eliminarDocumento(supabase, documentoId) {
  const eliminado = await documentoRepository.eliminarDocumento(supabase, documentoId);
  if (!eliminado) {
    throw new NotFoundError('No se encontró el documento a eliminar');
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 */
export async function generarUrlDescargaDocumento(supabase, documentoId) {
  // Reusa obtenerDocumento para que la visibilidad la siga decidiendo RLS:
  // si el usuario no puede ver la fila, ni llega a pedirse la URL firmada.
  const documento = await obtenerDocumento(supabase, documentoId);
  return documentoRepository.generarUrlDescargaDocumento(documento.archivo);
}
