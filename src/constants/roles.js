/**
 * Roles del sistema. Nunca escribir estos strings sueltos en otro
 * archivo — siempre importar desde acá.
 * @readonly
 * @enum {string}
 */
export const ROLES = Object.freeze({
  PENDIENTE: 'pendiente', // usuario invitado/registrado, aún no aprobado
  ADMIN: 'admin',
  JEFE_OBRA: 'jefe_obra',
  EMPLEADO: 'empleado',
  MECANICO: 'mecanico',
});

/** Roles con acceso administrativo total. */
export const ROLES_CON_ACCESO_TOTAL = Object.freeze([ROLES.ADMIN]);
