import { z } from 'zod';

export const crearItemObraSchema = z.object({
  tramo: z.string().optional(),
  nroItem: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción del ítem es obligatoria'),
  unidad: z.string().optional(),
  precioUnitario: z.number().optional(),
  cantidadContratada: z.number().optional(),
});

export const actualizarItemObraSchema = crearItemObraSchema.partial();

export const listarItemsObraQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
