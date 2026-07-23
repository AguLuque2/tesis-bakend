import * as historialEstadoService from '../services/historialEstado.service.js';
import { listarHistorialEstadoQuerySchema } from '../validators/historialEstado.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ValidationError } from '../errors/AppError.js';

export const listarPorObra = catchAsync(async (req, res) => {
  const parsed = listarHistorialEstadoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { historial, total } = await historialEstadoService.listarHistorialEstadoPorObra(
    req.supabase,
    req.params.obraId,
    parsed.data,
  );
  res.json({ data: historial, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const listarPorCertificacion = catchAsync(async (req, res) => {
  const parsed = listarHistorialEstadoQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { historial, total } = await historialEstadoService.listarHistorialEstadoPorCertificacion(
    req.supabase,
    req.params.certificacionId,
    parsed.data,
  );
  res.json({ data: historial, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});
