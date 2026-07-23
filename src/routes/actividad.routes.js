import { Router } from 'express';
import * as actividadController from '../controllers/actividad.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

// Rutas anidadas bajo /etapas/:etapaId/actividades
export const actividadPorEtapaRouter = Router({ mergeParams: true });

actividadPorEtapaRouter.use(requireAuth);

actividadPorEtapaRouter.get('/', actividadController.listarPorEtapa);
actividadPorEtapaRouter.post('/', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), actividadController.crear);

// Rutas de nivel superior /actividades
export const actividadRouter = Router();

actividadRouter.use(requireAuth);

actividadRouter.get('/:id', actividadController.obtener);
actividadRouter.patch('/:id', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), actividadController.actualizar);
actividadRouter.delete('/:id', requireRole(ROLES.ADMIN), actividadController.eliminar);
