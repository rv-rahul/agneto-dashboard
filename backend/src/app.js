'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');

const logger       = require('./config/logger');
const routes       = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const notFound     = require('./middleware/notFound');
const { TEAM_NAME } = require('./config/constants');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./config/swagger');

const app = express();

// ─── Security headers ─────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────
// CORS_ORIGINS in .env: '*' for dev, or comma-separated IPs for prod
// e.g. CORS_ORIGINS=http://192.168.1.50:4200,http://dashboard.local
const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── HTTP request logging ──────────────────────────────────
app.use(morgan('combined', {
  stream: { write: msg => logger.http(msg.trim()) },
}));

// ─── Health check (unauthenticated) ───────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    team:      TEAM_NAME,
    timestamp: new Date().toISOString(),
  });
});

// ─── Swagger UI ────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Team Agneto API Docs',
}));

// ─── API routes ────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 handler ───────────────────────────────────────────
app.use(notFound);

// ─── Global error handler (must be last) ───────────────────
app.use(errorHandler);

module.exports = app;
