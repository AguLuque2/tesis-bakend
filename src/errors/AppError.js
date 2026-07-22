/**
 * Clase base para errores de negocio conocidos. Cualquier código que
 * lance un error "esperado" (no un bug) debe extender esta clase,
 * nunca usar `throw new Error("...")` genérico ni `throw "string"`.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Mensaje seguro para mostrar al cliente
   * @param {number} statusCode - Código HTTP a devolver
   */
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // distingue errores "esperados" de bugs
  }
}

export class ValidationError extends AppError {
  /** @param {string} message */
  constructor(message = 'Los datos enviados no son válidos') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  /** @param {string} message */
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  /** @param {string} message */
  constructor(message = 'No tenés permiso para realizar esta acción') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  /** @param {string} message */
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  /** @param {string} message */
  constructor(message = 'El recurso ya existe o hay un conflicto de estado') {
    super(message, 409);
  }
}
