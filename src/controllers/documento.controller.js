import * as documentoService from '../services/documento.service.js';
import {
  crearDocumentoSchema,
  actualizarDocumentoSchema,
  listarDocumentosQuerySchema,
} from '../validators/documento.validator.js';
import { catchAsync } from '../utils/catchAsync.js';
import { ValidationError } from '../errors/AppError.js';

export const listarPorObra = catchAsync(async (req, res) => {
  const parsed = listarDocumentosQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const { documentos, total } = await documentoService.listarDocumentosPorObra(
    req.supabase,
    req.params.obraId,
    parsed.data,
  );
  res.json({ data: documentos, meta: { total, page: parsed.data.page, pageSize: parsed.data.pageSize } });
});

export const obtener = catchAsync(async (req, res) => {
  const documento = await documentoService.obtenerDocumento(req.supabase, req.params.id);
  res.json({ data: documento });
});

export const crear = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('Falta el archivo a subir (campo "archivo")');
  }

  const parsed = crearDocumentoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const documento = await documentoService.crearDocumento(
    req.supabase,
    req.params.obraId,
    parsed.data,
    req.file,
    req.usuario.authUserId,
  );
  res.status(201).json({ data: documento });
});

export const actualizar = catchAsync(async (req, res) => {
  const parsed = actualizarDocumentoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(', '));
  }

  const documento = await documentoService.actualizarDocumento(
    req.supabase,
    req.params.id,
    parsed.data,
    req.usuario.authUserId,
  );
  res.json({ data: documento });
});

export const eliminar = catchAsync(async (req, res) => {
  await documentoService.eliminarDocumento(req.supabase, req.params.id);
  res.status(204).send();
});

export const descargar = catchAsync(async (req, res) => {
  const { url, expiraEnSegundos } = await documentoService.generarUrlDescargaDocumento(req.supabase, req.params.id);
  res.json({ data: { url, expiraEnSegundos } });
});
