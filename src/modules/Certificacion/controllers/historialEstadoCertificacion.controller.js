import * as historialEstadoCertificacionService from '../services/historialEstadoCertificacion.service.js';
import { listarHistorialEstadoCertificacionQuerySchema } from '../validators/historialEstadoCertificacion.validator.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ValidationError } from '../../../errors/AppError.js';

export const listarPorCertificacion = catchAsync(async (req, res) => {
  const parsed = listarHistorialEstadoCertificacionQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { historial, total } = await historialEstadoCertificacionService.listarHistorialEstadoPorCertificacion(
    req.supabase,
    req.params.certificacionId,
    parsed.data,
  );
  res.json({ data: historial, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});
