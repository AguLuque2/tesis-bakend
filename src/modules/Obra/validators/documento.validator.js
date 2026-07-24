import { z } from 'zod';

export const crearDocumentoSchema = z.object({
  nombre: z.string().min(1).optional(),
  categoria: z.string().optional(),
  fechaSubida: z.string().date().optional(),
});

export const actualizarDocumentoSchema = z.object({
  nombre: z.string().min(1).optional(),
  categoria: z.string().optional(),
  estado: z.enum(['vigente', 'revision', 'obsoleto']).optional(),
});

export const listarDocumentosQuerySchema = z.object({
  estado: z.enum(['vigente', 'revision', 'obsoleto']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
