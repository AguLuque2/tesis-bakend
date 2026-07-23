import { Router } from 'express';
import { obraRouter } from './obra.routes.js';
import { certificacionRouter, certificacionPorObraRouter } from './certificacion.routes.js';
import { historialEstadoPorObraRouter, historialEstadoPorCertificacionRouter } from './historialEstado.routes.js';
import {
  certificacionItemRouter,
  certificacionItemPorCertificacionRouter,
} from './certificacionItem.routes.js';
import { itemObraRouter, itemObraPorObraRouter } from './itemObra.routes.js';

export const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/obras/:obraId/certificaciones', certificacionPorObraRouter);
router.use('/obras/:obraId/items', itemObraPorObraRouter);
router.use('/obras/:obraId/historial-estados', historialEstadoPorObraRouter);
router.use('/certificaciones/:certificacionId/historial-estados', historialEstadoPorCertificacionRouter);
router.use('/certificaciones/:certificacionId/items', certificacionItemPorCertificacionRouter);
router.use('/obras', obraRouter);
router.use('/items', itemObraRouter);
router.use('/certificaciones', certificacionRouter);
router.use('/certificacion-items', certificacionItemRouter);

// A medida que se arman los demás módulos (personal, vehiculos,
// materiales, etc.), se importan y montan acá siguiendo el mismo
// patrón que obra.routes.js / certificacion.routes.js.
