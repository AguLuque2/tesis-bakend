import { z } from 'zod';

export const crearActividadSchema = z.object({
  tipoActividadId: z.string().uuid('El tipo de actividad es obligatorio'),
  identificador: z.string().min(1, 'El identificador de la actividad es obligatorio'),
  fecha: z.string().date().optional(),
});

export const actualizarActividadSchema = crearActividadSchema.partial().extend({
  estado: z.string().optional(),
});

export const listarActividadesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
