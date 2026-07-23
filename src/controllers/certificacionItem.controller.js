import * as certificacionItemService from '../services/certificacionItem.service.js';
import {
  crearCertificacionItemSchema,
  actualizarCertificacionItemSchema,
  listarCertificacionItemsQuerySchema,
} from '../validators/certificacionItem.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ValidationError } from '../errors/AppError.js';

export const listarPorCertificacion = catchAsync(async (req, res) => {
  const parsed = listarCertificacionItemsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { items, total } = await certificacionItemService.listarCertificacionItemsPorCertificacion(
    req.supabase,
    req.params.certificacionId,
    parsed.data,
  );
  res.json({ data: items, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const obtener = catchAsync(async (req, res) => {
  const item = await certificacionItemService.obtenerCertificacionItem(req.supabase, req.params.id);
  res.json({ data: item });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearCertificacionItemSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const item = await certificacionItemService.crearCertificacionItem(
    req.supabase,
    req.params.certificacionId,
    parsed.data,
    req.usuario.authUserId,
  );
  res.status(201).json({ data: item });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarCertificacionItemSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const item = await certificacionItemService.actualizarCertificacionItem(
    req.supabase,
    req.params.id,
    parsed.data,
    req.usuario.authUserId,
  );
  res.json({ data: item });
});

export const eliminar = catchAsync(async (req, res) => {
  await certificacionItemService.eliminarCertificacionItem(req.supabase, req.params.id);
  res.status(204).send();
});
