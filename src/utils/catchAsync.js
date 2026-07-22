/**
 * Envuelve un controller async para que cualquier error que lance
 * (o cualquier promise rechazada) llegue automáticamente al
 * middleware de errores, sin repetir try/catch en cada controller.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<any>} fn
 * @returns {import('express').RequestHandler}
 */
export function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
