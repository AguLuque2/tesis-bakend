import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware de manejo de errores. Va SIEMPRE al final de la cadena
 * de middlewares en app.js. Ningún controller debe hacer try/catch
 * para formatear una respuesta de error — solo lanza el error
 * (o lo pasa con `next(error)`) y este middleware lo traduce.
 *
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        type: error.name,
      },
    });
  }

  // Error no controlado (bug real): nunca devolver el stack ni el
  // mensaje interno al cliente, solo loguearlo server-side.
  console.error('Error no controlado:', error);

  return res.status(500).json({
    error: {
      message: 'Ocurrió un error interno. Intentá de nuevo más tarde.',
      type: 'InternalServerError',
      ...(env.NODE_ENV === 'development' && { detail: error.message }),
    },
  });
}
