import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { config } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';

const app = express();

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for swagger UI development
}));

// CORS setup
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // max 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
});
app.use('/api', limiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Healthcheck
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString(), env: config.env }, 'DevFlow API Server is operational');
});

// Swagger API Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.warn('⚠️ Swagger documentation file could not be loaded');
}

// API Routes
app.use('/api/v1', apiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
