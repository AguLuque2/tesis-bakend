import { z } from 'zod';

export const crearCertificacionItemSchema = z.object({
  itemObraId: z.string().uuid('El ítem de obra es obligatorio'),
  cantidadAnterior: z.number().optional(),
  cantidadPresente: z.number().optional(),
  cantidadAcumulada: z.number().optional(),
  porcentajeAnterior: z.number().optional(),
  porcentajePresente: z.number().optional(),
  porcentajeAcumulado: z.number().optional(),
  montoAnterior: z.number().optional(),
  montoPresente: z.number().optional(),
  montoAcumulado: z.number().optional(),
});

export const actualizarCertificacionItemSchema = crearCertificacionItemSchema.partial();

export const listarCertificacionItemsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
