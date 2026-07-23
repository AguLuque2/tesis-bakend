import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { env } from '../config/env.js';
import { manejarErrorPostgres } from '../utils/manejarErrorpostgres.js';

const BUCKET = env.SUPABASE_STORAGE_BUCKET_DOCUMENTOS;

/**
 * @typedef {Object} Documento
 * @property {string} id
 * @property {string} obraId
 * @property {string} nombre
 * @property {string} categoria
 * @property {string} tipoArchivo
 * @property {string} tamano
 * @property {string} archivo - path dentro del bucket de Storage, no una URL pública
 * @property {string} fechaSubida
 * @property {string | null} subidoPor
 * @property {string} estado
 * @property {string} creadoEn
 * @property {string | null} creadoPor
 * @property {string} actualizadoEn
 * @property {string | null} actualizadoPor
 */

/**
 * @param {Record<string, any>} row - fila cruda de la tabla `documento` (snake_case)
 * @returns {Documento}
 */
function mapRowToDocumento(row) {
  return {
    id: row.id,
    obraId: row.obra_id,
    nombre: row.nombre,
    categoria: row.categoria,
    tipoArchivo: row.tipo_archivo,
    tamano: row.tamano,
    archivo: row.archivo,
    fechaSubida: row.fecha_subida,
    subidoPor: row.subido_por,
    estado: row.estado,
    creadoEn: row.creado_en,
    creadoPor: row.creado_por,
    actualizadoEn: row.actualizado_en,
    actualizadoPor: row.actualizado_por,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {{ estado?: string, page: number, pageSize: number }} filtros
 * @returns {Promise<{ documentos: Documento[], total: number }>}
 */
export async function listarDocumentosPorObra(supabase, obraId, filtros) {
  const desde = (filtros.page - 1) * filtros.pageSize;
  const hasta = desde + filtros.pageSize - 1;

  let query = supabase.from('documento').select('*', { count: 'exact' }).eq('obra_id', obraId).range(desde, hasta);

  if (filtros.estado) {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { documentos: (data ?? []).map(mapRowToDocumento), total: count ?? 0 };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 * @returns {Promise<Documento | null>}
 */
export async function obtenerDocumentoPorId(supabase, documentoId) {
  const { data, error } = await supabase.from('documento').select('*').eq('id', documentoId).maybeSingle();
  if (error) throw error;
  return data ? mapRowToDocumento(data) : null;
}

/**
 * Sube el binario a Supabase Storage (bucket privado) y devuelve el path
 * generado. Usa `supabaseAdmin` (service_role) porque el bucket no tiene
 * políticas para el cliente "por usuario" — la autorización real ya se
 * validó antes, a nivel de fila de `documento`, con RLS.
 *
 * @param {string} obraId
 * @param {{ buffer: Buffer, originalname: string, mimetype: string, size: number }} archivo - `req.file` de multer
 * @returns {Promise<string>} path dentro del bucket
 */
export async function subirArchivoDocumento(obraId, archivo) {
  const rutaStorage = `${obraId}/${randomUUID()}-${archivo.originalname}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(rutaStorage, archivo.buffer, {
    contentType: archivo.mimetype,
    upsert: false,
  });

  if (error) throw error;
  return rutaStorage;
}

/**
 * @param {string} rutaStorage
 * @returns {Promise<void>}
 */
export async function eliminarArchivoDocumentoStorage(rutaStorage) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([rutaStorage]);
  if (error) throw error;
}

/**
 * @param {string} rutaStorage
 * @returns {Promise<{ url: string, expiraEnSegundos: number }>}
 */
export async function generarUrlDescargaDocumento(rutaStorage) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(rutaStorage, env.DOCUMENTO_URL_DESCARGA_EXPIRA_SEGUNDOS);

  if (error) throw error;
  return { url: data.signedUrl, expiraEnSegundos: env.DOCUMENTO_URL_DESCARGA_EXPIRA_SEGUNDOS };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} obraId
 * @param {Partial<Documento>} datos
 * @param {string} usuarioAuthId - para completar creado_por, actualizado_por y subido_por
 * @returns {Promise<Documento>}
 */
export async function crearDocumento(supabase, obraId, datos, usuarioAuthId) {
  const { data, error } = await supabase
    .from('documento')
    .insert({
      obra_id: obraId,
      nombre: datos.nombre,
      categoria: datos.categoria,
      tipo_archivo: datos.tipoArchivo,
      tamano: datos.tamano,
      archivo: datos.archivo,
      fecha_subida: datos.fechaSubida,
      subido_por: usuarioAuthId,
      creado_por: usuarioAuthId,
      actualizado_por: usuarioAuthId,
    })
    .select('*')
    .single();

  if (error) manejarErrorPostgres(error);
  return mapRowToDocumento(data);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 * @param {Partial<Documento>} datos
 * @param {string} usuarioAuthId
 * @returns {Promise<Documento | null>}
 */
export async function actualizarDocumento(supabase, documentoId, datos, usuarioAuthId) {
  /** @type {Record<string, any>} */
  const cambios = { actualizado_por: usuarioAuthId };
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  if (datos.categoria !== undefined) cambios.categoria = datos.categoria;
  if (datos.estado !== undefined) cambios.estado = datos.estado;

  const { data, error } = await supabase
    .from('documento')
    .update(cambios)
    .eq('id', documentoId)
    .select('*')
    .maybeSingle();

  if (error) manejarErrorPostgres(error);
  return data ? mapRowToDocumento(data) : null;
}

/**
 * Borra la fila y, si existía, el objeto de Storage asociado.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} documentoId
 * @returns {Promise<boolean>} true si había una fila y se borró
 */
export async function eliminarDocumento(supabase, documentoId) {
  const { data: fila, error: errorLectura } = await supabase
    .from('documento')
    .select('archivo')
    .eq('id', documentoId)
    .maybeSingle();

  if (errorLectura) throw errorLectura;
  if (!fila) return false;

  const { error: errorBorrado } = await supabase.from('documento').delete().eq('id', documentoId);
  if (errorBorrado) throw errorBorrado;

  await eliminarArchivoDocumentoStorage(fila.archivo);
  return true;
}
