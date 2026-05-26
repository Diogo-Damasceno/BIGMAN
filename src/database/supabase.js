/**
 * supabase.js — Conexão com o Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('❌ SUPABASE_URL ou SUPABASE_ANON_KEY não configurados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

logger.info('✅ Supabase conectado com sucesso.');

module.exports = supabase;
