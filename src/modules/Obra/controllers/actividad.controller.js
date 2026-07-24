import * as actividadService from '../services/actividad.service.js';
import {
  crearActividadSchema,
  actualizarActividadSchema,
  listarActividadesQuerySchema,
} from '../validators/actividad.validator.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ValidationError } from '../../../errors/AppError.js';

export const listarPorEtapa = catchAsync(async (req, res) => {
  const parsed = listarActividadesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { actividades, total } = await actividadService.listarActividadesPorEtapa(
    req.supabase,
    req.params.etapaId,
    parsed.data,
  );
  res.json({ data: actividades, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const obtener = catchAsync(async (req, res) => {
  const actividad = await actividadService.obtenerActividad(req.supabase, req.params.id);
  res.json({ data: actividad });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearActividadSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const actividad = await actividadService.crearActividad(
    req.supabase,
    req.params.etapaId,
    parsed.data,
    req.usuario.authUserId,
  );
  res.status(201).json({ data: actividad });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarActividadSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const actividad = await actividadService.actualizarActividad(
    req.supabase,
    req.params.id,
    parsed.data,
    req.usuario.authUserId,
  );
  res.json({ data: actividad });
});

export const eliminar = catchAsync(async (req, res) => {
  await actividadService.eliminarActividad(req.supabase, req.params.id);
  res.status(204).send();
});
