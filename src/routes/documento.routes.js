import { Router } from 'express';
import * as documentoController from '../controllers/documento.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';
import { subirArchivoUnico, manejarErrorMulter } from '../middlewares/upload.js';

// Rutas anidadas bajo /obras/:obraId/documentos
export const documentoPorObraRouter = Router({ mergeParams: true });

documentoPorObraRouter.use(requireAuth);

documentoPorObraRouter.get('/', documentoController.listarPorObra);
documentoPorObraRouter.post(
  '/',
  requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA),
  subirArchivoUnico.single('archivo'),
  manejarErrorMulter,
  documentoController.crear,
);

// Rutas de nivel superior /documentos
export const documentoRouter = Router();

documentoRouter.use(requireAuth);

documentoRouter.get('/:id', documentoController.obtener);
documentoRouter.get('/:id/descargar', documentoController.descargar);
documentoRouter.patch('/:id', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), documentoController.actualizar);
documentoRouter.delete('/:id', requireRole(ROLES.ADMIN), documentoController.eliminar);
