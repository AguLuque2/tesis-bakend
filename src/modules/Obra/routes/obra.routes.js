import { Router } from 'express';
import * as obraController from '../controllers/obra.controller.js';
import { requireAuth, requireRole } from '../../../middlewares/auth.js';
import { ROLES } from '../../../constants/roles.js';

export const obraRouter = Router();

obraRouter.use(requireAuth);

obraRouter.get('/', obraController.listar);
obraRouter.get('/:id', obraController.obtener);
obraRouter.post('/', requireRole(ROLES.ADMIN), obraController.crear);
obraRouter.patch('/:id', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), obraController.actualizar);
