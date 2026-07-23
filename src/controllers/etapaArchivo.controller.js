import * as etapaArchivoService from '../services/etapaArchivo.service.js';
import {
  crearEtapaArchivoSchema,
  actualizarEtapaArchivoSchema,
  listarEtapaArchivosQuerySchema,
} from '../validators/etapaArchivo.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ValidationError } from '../errors/AppError.js';

export const listarPorEtapa = catchAsync(async (req, res) => {
  const parsed = listarEtapaArchivosQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { archivos, total } = await etapaArchivoService.listarEtapaArchivosPorEtapa(
    req.supabase,
    req.params.etapaId,
    parsed.data,
  );
  res.json({ data: archivos, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const obtener = catchAsync(async (req, res) => {
  const archivo = await etapaArchivoService.obtenerEtapaArchivo(req.supabase, req.params.id);
  res.json({ data: archivo });
});

export const crear = catchAsync(async (req, res) => {
  const parsed = crearEtapaArchivoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const archivo = await etapaArchivoService.crearEtapaArchivo(
    req.supabase,
    req.params.etapaId,
    parsed.data,
    req.usuario.authUserId,
  );
  res.status(201).json({ data: archivo });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarEtapaArchivoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const archivo = await etapaArchivoService.actualizarEtapaArchivo(
    req.supabase,
    req.params.id,
    parsed.data,
    req.usuario.authUserId,
  );
  res.json({ data: archivo });
});

export const eliminar = catchAsync(async (req, res) => {
  await etapaArchivoService.eliminarEtapaArchivo(req.supabase, req.params.id);
  res.status(204).send();
});
