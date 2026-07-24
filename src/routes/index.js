import { Router } from 'express';
import { obraRouter } from '../modules/Obra/routes/obra.routes.js';
import { itemObraRouter, itemObraPorObraRouter } from '../modules/Obra/routes/itemObra.routes.js';
import { etapaRouter, etapaPorObraRouter } from '../modules/Obra/routes/etapa.routes.js';
import { actividadRouter, actividadPorEtapaRouter } from '../modules/Obra/routes/actividad.routes.js';
import { etapaArchivoRouter, etapaArchivoPorEtapaRouter } from '../modules/Obra/routes/etapaArchivo.routes.js';
import { documentoRouter, documentoPorObraRouter } from '../modules/Obra/routes/documento.routes.js';
import { historialEstadoPorObraRouter } from '../modules/Obra/routes/historialEstadoObra.routes.js';
import {
  certificacionRouter,
  certificacionPorObraRouter,
} from '../modules/Certificacion/routes/certificacion.routes.js';
import {
  certificacionItemRouter,
  certificacionItemPorCertificacionRouter,
} from '../modules/Certificacion/routes/certificacionItem.routes.js';
import { historialEstadoPorCertificacionRouter } from '../modules/Certificacion/routes/historialEstadoCertificacion.routes.js';

export const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/obras/:obraId/certificaciones', certificacionPorObraRouter);
router.use('/obras/:obraId/items', itemObraPorObraRouter);
router.use('/obras/:obraId/etapas', etapaPorObraRouter);
router.use('/obras/:obraId/historial-estados', historialEstadoPorObraRouter);
router.use('/obras/:obraId/documentos', documentoPorObraRouter);
router.use('/certificaciones/:certificacionId/historial-estados', historialEstadoPorCertificacionRouter);
router.use('/certificaciones/:certificacionId/items', certificacionItemPorCertificacionRouter);
router.use('/etapas/:etapaId/actividades', actividadPorEtapaRouter);
router.use('/etapas/:etapaId/archivos', etapaArchivoPorEtapaRouter);
router.use('/obras', obraRouter);
router.use('/items', itemObraRouter);
router.use('/etapas', etapaRouter);
router.use('/actividades', actividadRouter);
router.use('/etapa-archivos', etapaArchivoRouter);
router.use('/documentos', documentoRouter);
router.use('/certificaciones', certificacionRouter);
router.use('/certificacion-items', certificacionItemRouter);

// A medida que se arman los demás módulos (MaterialesYCompra, Vehiculos,
// Usuarios), se importan y montan acá siguiendo el mismo patrón que
// src/modules/Obra y src/modules/Certificacion.
