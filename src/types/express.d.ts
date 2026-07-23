// Archivo .d.ts (no .js): "declare global" no tiene equivalente en JSDoc, así
// que esta es la única forma de tipar las propiedades que requireAuth agrega
// a `req`. No se ejecuta ni se importa nunca — solo lo lee el TS Server.
import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      /** Cliente de Supabase scoped al usuario autenticado (RLS aplica). Seteado por `requireAuth`. */
      supabase: SupabaseClient;
      /** Registro de `usuario` vinculado al JWT de la request. Seteado por `requireAuth`. */
      usuario: import('../repositories/usuario.repository.js').Usuario;
    }
  }
}

export {};
