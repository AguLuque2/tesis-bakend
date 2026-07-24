import { Router } from 'express';
import * as etapaController from '../controllers/etapa.controller.js';
import { requireAuth, requireRole } from '../../../middlewares/auth.js';
import { ROLES } from '../../../constants/roles.js';

// Rutas anidadas bajo /obras/:obraId/etapas
export const etapaPorObraRouter = Router({ mergeParams: true });

etapaPorObraRouter.use(requireAuth);

etapaPorObraRouter.get('/', etapaController.listarPorObra);
etapaPorObraRouter.post('/', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), etapaController.crear);

// Rutas de nivel superior /etapas
export const etapaRouter = Router();

etapaRouter.use(requireAuth);

etapaRouter.get('/:id', etapaController.obtener);
etapaRouter.patch('/:id', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), etapaController.actualizar);
etapaRouter.delete('/:id', requireRole(ROLES.ADMIN), etapaController.eliminar);
