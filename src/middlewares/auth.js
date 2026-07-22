import { getSupabaseClientForUser } from '../config/supabaseClient.js';
import { obtenerUsuarioPorAuthUserId } from '../repositories/usuario.repository.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Requiere que la request tenga un JWT válido de Supabase Auth en el
 * header Authorization, y que exista un `usuario` cargado y activo
 * para ese auth_user_id.
 *
 * Deja disponibles para el resto de la cadena:
 * - req.supabase: cliente scoped al usuario (RLS aplica en cada query)
 * - req.usuario: el registro de `usuario` (id, rol, estado, etc.)
 */
export const requireAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization ?? '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    throw new UnauthorizedError('Falta el token de autenticación');
  }

  const supabase = getSupabaseClientForUser(accessToken);
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !authData?.user) {
    throw new UnauthorizedError('Token inválido o expirado');
  }

  const usuario = await obtenerUsuarioPorAuthUserId(supabase, authData.user.id);

  if (!usuario) {
    throw new ForbiddenError('Tu cuenta de Google no está vinculada a ningún usuario del sistema');
  }

  if (usuario.estado === 'pendiente_aprobacion') {
    throw new ForbiddenError('Tu cuenta está pendiente de aprobación por un administrador');
  }

  if (usuario.estado === 'suspendido') {
    throw new ForbiddenError('Tu cuenta fue suspendida. Contactá a un administrador');
  }

  req.supabase = supabase;
  req.usuario = usuario;
  next();
});

/**
 * Requiere que el usuario autenticado tenga uno de los roles indicados.
 * Usar SIEMPRE después de `requireAuth` en la cadena de middlewares.
 *
 * @param {...string} rolesPermitidos
 * @returns {import('express').RequestHandler}
 */
export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new UnauthorizedError());
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new ForbiddenError('Tu rol no tiene permiso para esta acción'));
    }
    next();
  };
}
