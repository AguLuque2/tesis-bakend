import { Router } from 'express';
import { obraRouter } from './obra.routes.js';
import { certificacionRouter, certificacionPorObraRouter } from './certificacion.routes.js';
import { historialEstadoPorObraRouter, historialEstadoPorCertificacionRouter } from './historialEstado.routes.js';

export const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/obras/:obraId/certificaciones', certificacionPorObraRouter);
router.use('/obras/:obraId/historial-estados', historialEstadoPorObraRouter);
router.use('/certificaciones/:certificacionId/historial-estados', historialEstadoPorCertificacionRouter);
router.use('/obras', obraRouter);
router.use('/certificaciones', certificacionRouter);

// A medida que se arman los demás módulos (personal, vehiculos,
// materiales, etc.), se importan y montan acá siguiendo el mismo
// patrón que obra.routes.js / certificacion.routes.js.
