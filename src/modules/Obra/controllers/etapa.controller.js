import * as etapaService from '../services/etapa.service.js';
import { crearEtapaSchema, actualizarEtapaSchema, listarEtapasQuerySchema } from '../validators/etapa.validator.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ValidationError } from '../../../errors/AppError.js';

export const listarPorObra = catchAsync(async (req, res) => {
  const parsed = listarEtapasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { etapas, total } = await etapaService.listarEtapasPorObra(req.supabase, req.params.obraId, parsed.data);
  res.json({ data: etapas, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearEtapaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const etapa = await etapaService.crearEtapa(req.supabase, req.params.obraId, parsed.data, req.usuario.authUserId);
  res.status(201).json({ data: etapa });
});

export const obtener = catchAsync(async (req, res) => {
  const etapa = await etapaService.obtenerEtapa(req.supabase, req.params.id);
  res.json({ data: etapa });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarEtapaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const etapa = await etapaService.actualizarEtapa(req.supabase, req.params.id, parsed.data, req.usuario.authUserId);
  res.json({ data: etapa });
});

export const eliminar = catchAsync(async (req, res) => {
  await etapaService.eliminarEtapa(req.supabase, req.params.id);
  res.status(204).send();
});
