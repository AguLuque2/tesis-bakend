import { Router } from 'express';
import * as certificacionController from '../controllers/certificacion.controller.js';
import { requireAuth, requireRole } from '../../../middlewares/auth.js';
import { ROLES } from '../../../constants/roles.js';

// Rutas anidadas bajo /obras/:obraId/certificaciones
export const certificacionPorObraRouter = Router({ mergeParams: true });

certificacionPorObraRouter.use(requireAuth);
certificacionPorObraRouter.use(requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA));

certificacionPorObraRouter.get('/', certificacionController.listarPorObra);
certificacionPorObraRouter.post('/', certificacionController.crear);

// Rutas de nivel superior /certificaciones
export const certificacionRouter = Router();

certificacionRouter.use(requireAuth);
certificacionRouter.use(requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA));

certificacionRouter.get('/:id', certificacionController.obtener);
certificacionRouter.patch('/:id', certificacionController.actualizar);