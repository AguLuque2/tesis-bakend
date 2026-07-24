import { z } from 'zod';

export const crearObraSchema = z.object({
  codigo: z.string().min(1).optional(),
  nombre: z.string().min(1, 'El nombre de la obra es obligatorio'),
  cliente: z.string().optional(),
  tipoObra: z.string().optional(),
  ubicacion: z.string().optional(),
  fechaInicioPlanificada: z.string().date().optional(),
  fechaFinPlanificada: z.string().date().optional(),
  responsable: z.string().optional(),
  descripcion: z.string().optional(),
});

export const actualizarObraSchema = crearObraSchema.partial();

export const listarObrasQuerySchema = z.object({
  estado: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
