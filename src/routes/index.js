import { Router } from 'express';
import { obraRouter } from './obra.routes.js';

export const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/obras', obraRouter);

// A medida que se arman los demás módulos (certificaciones, personal,
// vehiculos, materiales, etc.), se importan y montan acá siguiendo
// el mismo patrón que obra.routes.js.
