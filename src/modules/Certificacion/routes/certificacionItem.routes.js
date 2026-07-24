import { Router } from 'express';
import * as certificacionItemController from '../controllers/certificacionItem.controller.js';
import { requireAuth, requireRole } from '../../../middlewares/auth.js';
import { ROLES } from '../../../constants/roles.js';

// Rutas anidadas bajo /certificaciones/:certificacionId/items
export const certificacionItemPorCertificacionRouter = Router({ mergeParams: true });

certificacionItemPorCertificacionRouter.use(requireAuth);
certificacionItemPorCertificacionRouter.use(requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA));

certificacionItemPorCertificacionRouter.get('/', certificacionItemController.listarPorCertificacion);
certificacionItemPorCertificacionRouter.post('/', certificacionItemController.crear);

// Rutas de nivel superior /certificacion-items
export const certificacionItemRouter = Router();

certificacionItemRouter.use(requireAuth);
certificacionItemRouter.use(requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA));

certificacionItemRouter.get('/:id', certificacionItemController.obtener);
certificacionItemRouter.patch('/:id', certificacionItemController.actualizar);
// El borrado, igual que la política delete_cascada de la base, queda reservado a admin.
certificacionItemRouter.delete('/:id', requireRole(ROLES.ADMIN), certificacionItemController.eliminar);
