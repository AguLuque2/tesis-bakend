/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} authUserId
 * @property {string} empleadoId
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} email
 * @property {'pendiente'|'admin'|'jefe_obra'|'empleado'|'mecanico'} rol
 * @property {'pendiente_aprobacion'|'activo'|'suspendido'} estado
 */

/**
 * Busca el registro de `usuario` vinculado a un auth_user_id de Supabase Auth.
 * Traduce snake_case (base) -> camelCase (código), como corresponde a esta capa.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase - cliente scoped al usuario (RLS aplica)
 * @param {string} authUserId
 * @returns {Promise<Usuario | null>}
 */
export async function obtenerUsuarioPorAuthUserId(supabase, authUserId) {
  const { data, error } = await supabase
    .from('usuario')
    .select('id, auth_user_id, empleado_id, nombre, apellido, email, rol, estado')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    empleadoId: data.empleado_id,
    nombre: data.nombre,
    apellido: data.apellido,
    email: data.email,
    rol: data.rol,
    estado: data.estado,
  };
}
