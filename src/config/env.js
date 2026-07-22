import { z } from 'zod';
import 'dotenv/config';

/**
 * Schema de validación de variables de entorno.
 * Si falta o está mal alguna variable, la app falla al arrancar
 * en vez de fallar más tarde en producción de forma silenciosa.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  SUPABASE_URL: z.string().url({ message: 'SUPABASE_URL debe ser una URL válida' }),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es obligatoria'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es obligatoria'),

  CORS_ALLOWED_ORIGINS: z.string().min(1, 'CORS_ALLOWED_ORIGINS es obligatoria'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(' Variables de entorno inválidas o faltantes:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Config de entorno ya validada y tipada por JSDoc.
 * Importar SIEMPRE desde acá, nunca leer `process.env` directo
 * en otro archivo del proyecto.
 * @type {{
 *   NODE_ENV: 'development' | 'production' | 'test',
 *   PORT: number,
 *   SUPABASE_URL: string,
 *   SUPABASE_ANON_KEY: string,
 *   SUPABASE_SERVICE_ROLE_KEY: string,
 *   CORS_ALLOWED_ORIGINS: string[],
 *   RATE_LIMIT_WINDOW_MS: number,
 *   RATE_LIMIT_MAX_REQUESTS: number,
 * }}
 */
export const env = {
  ...parsed.data,
  CORS_ALLOWED_ORIGINS: parsed.data.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
};
