/**
 * cortes.repository.js — Consultas à tabela "cortes" no Supabase
 */

const supabase = require('../database/supabase');
const logger = require('../utils/logger');

/**
 * Busca todos os cortes cadastrados no banco.
 * @returns {Promise<Array>}
 */
const getAllCortes = async () => {
  const { data, error } = await supabase
    .from('cortes')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    logger.error('Erro ao buscar cortes:', error.message);
    throw new Error('Falha ao consultar cortes.');
  }

  return data;
};

/**
 * Busca um corte pelo nome (busca parcial, case-insensitive).
 * @param {string} nome - Nome do corte pesquisado pelo cliente
 * @returns {Promise<Object|null>}
 */
const getCorteByNome = async (nome) => {
  const { data, error } = await supabase
    .from('cortes')
    .select('*')
    .ilike('nome', `%${nome}%`)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found (não é erro crítico)
    logger.error('Erro ao buscar corte por nome:', error.message);
    return null;
  }

  return data || null;
};

/**
 * Salva um registro de atendimento finalizado.
 * @param {Object} atendimento
 */
const salvarAtendimento = async (atendimento) => {
  const { data, error } = await supabase
    .from('atendimentos')
    .insert([atendimento])
    .select()
    .single();

  if (error) {
    logger.error('Erro ao salvar atendimento:', error.message);
    // Não lança erro para não travar o fluxo
    return null;
  }

  logger.info(`📝 Atendimento salvo — Cliente: ${atendimento.cliente_nome}`);
  return data;
};

module.exports = { getAllCortes, getCorteByNome, salvarAtendimento };
