import { Router } from 'express';
import * as historialEstadoObraController from '../controllers/historialEstadoObra.controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

// Rutas anidadas bajo /obras/:obraId/historial-estados
export const historialEstadoPorObraRouter = Router({ mergeParams: true });

historialEstadoPorObraRouter.use(requireAuth);

historialEstadoPorObraRouter.get('/', historialEstadoObraController.listarPorObra);
