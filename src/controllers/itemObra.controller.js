import * as itemObraService from '../services/itemObra.service.js';
import {
  crearItemObraSchema,
  actualizarItemObraSchema,
  listarItemsObraQuerySchema,
} from '../validators/itemObra.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ValidationError } from '../errors/AppError.js';

export const listarPorObra = catchAsync(async (req, res) => {
  const parsed = listarItemsObraQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { items, total } = await itemObraService.listarItemsObraPorObra(
    req.supabase,
    req.params.obraId,
    parsed.data,
  );
  res.json({ data: items, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearItemObraSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const item = await itemObraService.crearItemObra(req.supabase, req.params.obraId, parsed.data, req.usuario.authUserId);
  res.status(201).json({ data: item });
});

export const obtener = catchAsync(async (req, res) => {
  const item = await itemObraService.obtenerItemObra(req.supabase, req.params.id);
  res.json({ data: item });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarItemObraSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const item = await itemObraService.actualizarItemObra(req.supabase, req.params.id, parsed.data, req.usuario.authUserId);
  res.json({ data: item });
});

export const eliminar = catchAsync(async (req, res) => {
  await itemObraService.eliminarItemObra(req.supabase, req.params.id);
  res.status(204).send();
});
