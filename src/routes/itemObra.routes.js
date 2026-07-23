import { Router } from 'express';
import * as itemObraController from '../controllers/itemObra.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

// Rutas anidadas bajo /obras/:obraId/items
export const itemObraPorObraRouter = Router({ mergeParams: true });

itemObraPorObraRouter.use(requireAuth);

itemObraPorObraRouter.get('/', itemObraController.listarPorObra);
itemObraPorObraRouter.post('/', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), itemObraController.crear);

// Rutas de nivel superior /items
export const itemObraRouter = Router();

itemObraRouter.use(requireAuth);

itemObraRouter.get('/:id', itemObraController.obtener);
itemObraRouter.patch('/:id', requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA), itemObraController.actualizar);
itemObraRouter.delete('/:id', requireRole(ROLES.ADMIN), itemObraController.eliminar);
