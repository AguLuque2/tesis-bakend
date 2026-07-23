import { Router } from 'express';
import * as etapaArchivoController from '../controllers/etapaArchivo.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

// Rutas anidadas bajo /etapas/:etapaId/archivos
export const etapaArchivoPorEtapaRouter = Router({ mergeParams: true });

etapaArchivoPorEtapaRouter.use(requireAuth);

etapaArchivoPorEtapaRouter.get('/', etapaArchivoController.listarPorEtapa);
etapaArchivoPorEtapaRouter.post('/', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), etapaArchivoController.crear);

// Rutas de nivel superior /etapa-archivos
export const etapaArchivoRouter = Router();

etapaArchivoRouter.use(requireAuth);

etapaArchivoRouter.get('/:id', etapaArchivoController.obtener);
etapaArchivoRouter.patch('/:id', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), etapaArchivoController.actualizar);
etapaArchivoRouter.delete('/:id', requireRole(ROLES.ADMIN), etapaArchivoController.eliminar);
