import { z } from 'zod';

export const crearEtapaArchivoSchema = z.object({
  tipo: z.string().optional(),
  nombreArchivo: z.string().min(1, 'El nombre del archivo es obligatorio'),
  archivo: z.string().min(1, 'La referencia al archivo es obligatoria'),
  fechaSubida: z.string().date().optional(),
});

export const actualizarEtapaArchivoSchema = crearEtapaArchivoSchema.partial();

export const listarEtapaArchivosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
