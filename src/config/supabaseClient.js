import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Cliente "admin": usa la service_role key, que **bypasea RLS por completo**.
 *
 * Uso restringido a casos puntuales donde el backend necesita operar
 * sin las restricciones de un usuario (ej: procesos internos, jobs).
 * NUNCA usar este cliente para responder una request de un usuario común
 * sin antes validar vos mismo, a mano, que tiene permiso para esa acción.
 *
 * Esta key nunca se loguea ni se expone en ninguna respuesta HTTP.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Cliente "por request": usa la clave anon + el JWT del usuario logueado.
 * Con esto, todas las queries respetan las políticas de RLS como si el
 * usuario estuviera hablando directo con la base — es el cliente que
 * hay que usar en el 99% de los repositories.
 *
 * @param {string} accessToken - JWT del usuario, extraído del header Authorization
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseClientForUser(accessToken) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
