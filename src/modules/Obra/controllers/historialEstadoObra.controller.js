import * as historialEstadoObraService from '../services/historialEstadoObra.service.js';
import { listarHistorialEstadoObraQuerySchema } from '../validators/historialEstadoObra.validator.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ValidationError } from '../../../errors/AppError.js';

export const listarPorObra = catchAsync(async (req, res) => {
  const parsed = listarHistorialEstadoObraQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { historial, total } = await historialEstadoObraService.listarHistorialEstadoPorObra(
    req.supabase,
    req.params.obraId,
    parsed.data,
  );
  res.json({ data: historial, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});
