import * as obraService from '../services/obra.service.js';
import { crearObraSchema, actualizarObraSchema, listarObrasQuerySchema } from '../validators/obra.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ValidationError } from '../errors/AppError.js';

export const listar = catchAsync(async (req, res) => {
  const parsed = listarObrasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { obras, total } = await obraService.listarObras(req.supabase, parsed.data);
  res.json({ data: obras, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const obtener = catchAsync(async (req, res) => {
  const obra = await obraService.obtenerObra(req.supabase, req.params.id);
  res.json({ data: obra });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearObraSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const obra = await obraService.crearObra(req.supabase, parsed.data, req.usuario.authUserId);
  res.status(201).json({ data: obra });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarObraSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const obra = await obraService.actualizarObra(req.supabase, req.params.id, parsed.data, req.usuario.authUserId);
  res.json({ data: obra });
});
