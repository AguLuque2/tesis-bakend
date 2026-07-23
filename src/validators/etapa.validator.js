import { z } from 'zod';

export const crearEtapaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la etapa es obligatorio'),
  empresaEjecutora: z.string().optional(),
  fechaInicioPlanificada: z.string().date().optional(),
  fechaFinPlanificada: z.string().date().optional(),
  porcentajeAvance: z.number().optional(),
  presupuestoAsignado: z.number().optional(),
  gastoReal: z.number().optional(),
});

export const actualizarEtapaSchema = crearEtapaSchema.partial();

export const listarEtapasQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
