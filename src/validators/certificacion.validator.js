import { z } from 'zod';

export const crearCertificacionSchema = z.object({
  numero: z.string().min(1).optional(),
  periodoDesde: z.string().date().optional(),
  periodoHasta: z.string().date().optional(),
  fechaEmision: z.string().date().optional(),
  montoBrutoCertificado: z.number().optional(),
  porcentajeAvanceMes: z.number().optional(),
  montoAcumulado: z.number().optional(),
});

export const actualizarCertificacionSchema = crearCertificacionSchema.partial();

export const listarCertificacionesQuerySchema = z.object({
  estado: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});