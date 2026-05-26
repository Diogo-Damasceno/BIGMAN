/**
 * validateEnv.js — Middleware de validação de variáveis de ambiente
 *
 * Verifica se todas as variáveis obrigatórias estão configuradas
 * antes de processar qualquer requisição.
 */

const logger = require('../utils/logger');

const REQUIRED_VARS = [
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_VERIFY_TOKEN',
  'GEMINI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

/**
 * Valida variáveis de ambiente na inicialização.
 * Encerra o processo se alguma estiver faltando.
 */
const validateEnvVars = () => {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    logger.error('❌ Variáveis de ambiente obrigatórias não configuradas:');
    missing.forEach((v) => logger.error(`   → ${v}`));
    logger.error('💡 Verifique seu arquivo .env');
    process.exit(1);
  }

  logger.info('✅ Todas as variáveis de ambiente estão configuradas.');
};

module.exports = { validateEnvVars };
