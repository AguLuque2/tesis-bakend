import { ConflictError, ValidationError } from '../errors/AppError.js';

/**
 * Traduce un error devuelto por el cliente de Supabase (basado en los
 * códigos de error estándar de Postgres) a una clase de error propia
 * del proyecto. Se llama SIEMPRE que un insert/update pueda chocar
 * con una restricción de la base, en vez de repetir el chequeo de
 * `error.code` a mano en cada repository.
 *
 * Si el código no es uno de los conocidos, relanza el error tal cual
 * para que el middleware de errores lo trate como un 500 real (bug
 * genuino, no un error de negocio esperado).
 *
 * @param {{ code?: string, message?: string, details?: string }} error
 * @returns {never}
 */
export function manejarErrorPostgres(error) {
  switch (error?.code) {
    case '23505': // unique_violation
      throw new ConflictError('Ya existe un registro con esos datos');
    case '23503': // foreign_key_violation
      throw new ValidationError('Hace referencia a un registro que no existe');
    case '23502': // not_null_violation
      throw new ValidationError('Falta un dato obligatorio');
    default:
      throw error;
  }
}