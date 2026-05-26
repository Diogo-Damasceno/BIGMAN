/**
 * server.js — Ponto de entrada da aplicação
 * BIG MAN Barber Shop — Sistema de Atendimento WhatsApp
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const webhookRoutes = require('./routes/webhook.routes');
const logger = require('./utils/logger');
const { validateEnvVars } = require('./middlewares/validateEnv');

// Valida variáveis antes de iniciar qualquer coisa
validateEnvVars();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globais ───────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));

// O webhook da Meta envia o body como JSON, exceto na verificação (GET)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rotas ────────────────────────────────────────────────────
app.use('/webhook', webhookRoutes);

// Health-check
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    app: 'BIG MAN Barber Shop — WhatsApp Bot',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ─── Tratamento global de erros ───────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

// ─── Iniciar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 BIG MAN Bot rodando na porta ${PORT}`);
  logger.info(`📱 Webhook disponível em: http://localhost:${PORT}/webhook`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
