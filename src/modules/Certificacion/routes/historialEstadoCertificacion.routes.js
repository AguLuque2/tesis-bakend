import { Router } from 'express';
import * as historialEstadoCertificacionController from '../controllers/historialEstadoCertificacion.controller.js';
import { requireAuth, requireRole } from '../../../middlewares/auth.js';
import { ROLES } from '../../../constants/roles.js';

// Rutas anidadas bajo /certificaciones/:certificacionId/historial-estados
// Mismo criterio de acceso que certificacion.routes.js: es un endpoint del
// módulo de Certificación, Empleado/Mecánico no deben poder entrar.
export const historialEstadoPorCertificacionRouter = Router({ mergeParams: true });

historialEstadoPorCertificacionRouter.use(requireAuth);
historialEstadoPorCertificacionRouter.use(requireRole(ROLES.ADMIN, ROLES.JEFE_OBRA));

historialEstadoPorCertificacionRouter.get('/', historialEstadoCertificacionController.listarPorCertificacion);
