import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { router } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiting general — más estricto en endpoints de auth si se agregan.
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api', router);

// Middleware de errores: SIEMPRE al final, después de todas las rutas.
app.use(errorHandler);
