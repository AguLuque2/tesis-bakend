import * as certificacionService from '../services/certificacion.service.js';
import {
  crearCertificacionSchema,
  actualizarCertificacionSchema,
  listarCertificacionesQuerySchema,
} from '../validators/certificacion.validator.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ValidationError } from '../../../errors/AppError.js';

export const listarPorObra = catchAsync(async (req, res) => {
  const parsed = listarCertificacionesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { certificaciones, total } = await certificacionService.listarCertificacionesPorObra(
    req.supabase,
    req.params.obraId,
    parsed.data,
  );
  res.json({ data: certificaciones, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const obtener = catchAsync(async (req, res) => {
  const certificacion = await certificacionService.obtenerCertificacion(req.supabase, req.params.id);
  res.json({ data: certificacion });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearCertificacionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const certificacion = await certificacionService.crearCertificacion(
    req.supabase,
    req.params.obraId,
    parsed.data,
    req.usuario.authUserId,
  );
  res.status(201).json({ data: certificacion });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarCertificacionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const certificacion = await certificacionService.actualizarCertificacion(
    req.supabase,
    req.params.id,
    parsed.data,
    req.usuario.authUserId,
  );
  res.json({ data: certificacion });
});