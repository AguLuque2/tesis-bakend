import multer from 'multer';
import { env } from '../config/env.js';
import { ValidationError } from '../errors/AppError.js';

/**
 * Middleware que parsea un único archivo de un form-data (en memoria,
 * nunca a disco) para subirlo después a Supabase Storage. El límite de
 * tamaño sale de env, nunca hardcodeado.
 */
export const subirArchivoUnico = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.DOCUMENTO_TAMANO_MAXIMO_MB * 1024 * 1024 },
});

/**
 * Traduce los errores propios de multer (archivo demasiado grande, campo
 * mal formado, etc.) a `ValidationError`, para no dejar que lleguen al
 * middleware de errores como un 500 genérico. Va SIEMPRE inmediatamente
 * después de un middleware de `subirArchivoUnico` en la cadena de rutas.
 *
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export function manejarErrorMulter(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(
        new ValidationError(`El archivo supera el tamaño máximo permitido (${env.DOCUMENTO_TAMANO_MAXIMO_MB} MB)`),
      );
    }
    return next(new ValidationError('No se pudo procesar el archivo subido'));
  }
  next(error);
}
