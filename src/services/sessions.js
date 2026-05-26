/**
 * sessions.js — Gerenciamento de sessões por usuário em memória
 *
 * Mantém o estado da conversa de cada cliente para que a IA
 * saiba em qual etapa do atendimento o usuário se encontra.
 *
 * Etapas (stages):
 *  GREETING   → acabou de chegar, aguardando nome
 *  AWAITING_HAIRCUT → nome coletado, aguardando tipo de corte
 *  AWAITING_SCHEDULE → preço informado, aguardando confirmação de agendamento
 *  DONE       → fluxo concluído
 */

const logger = require('../utils/logger');

// Mapa em memória: { [phoneNumber]: SessionObject }
const sessions = new Map();

// Tempo de expiração da sessão: 30 minutos de inatividade
const SESSION_TTL_MS = 30 * 60 * 1000;

/**
 * Retorna a sessão do usuário, criando uma nova se não existir.
 * @param {string} phone
 * @returns {Object}
 */
const getSession = (phone) => {
  if (!sessions.has(phone)) {
    sessions.set(phone, createNewSession(phone));
    logger.debug(`🆕 Nova sessão criada para ${phone}`);
  }

  const session = sessions.get(phone);
  session.lastActivity = Date.now();
  return session;
};

/**
 * Atualiza campos da sessão do usuário.
 * @param {string} phone
 * @param {Object} updates
 */
const updateSession = (phone, updates) => {
  const session = getSession(phone);
  Object.assign(session, updates, { lastActivity: Date.now() });
  sessions.set(phone, session);
  logger.debug(`🔄 Sessão atualizada para ${phone}:`, updates);
};

/**
 * Remove a sessão do usuário (reset do fluxo).
 * @param {string} phone
 */
const clearSession = (phone) => {
  sessions.delete(phone);
  logger.debug(`🗑️ Sessão removida para ${phone}`);
};

/**
 * Cria um objeto de sessão inicial.
 * @param {string} phone
 */
const createNewSession = (phone) => ({
  phone,
  stage: 'GREETING',
  clienteNome: null,
  corteNome: null,
  cortePreco: null,
  history: [],             // histórico de mensagens para o Gemini
  lastActivity: Date.now(),
});

/**
 * Limpa sessões expiradas (chamado periodicamente).
 */
const cleanExpiredSessions = () => {
  const now = Date.now();
  let removed = 0;

  for (const [phone, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(phone);
      removed++;
    }
  }

  if (removed > 0) {
    logger.info(`🧹 ${removed} sessão(ões) expirada(s) removida(s).`);
  }
};

// Limpar sessões a cada 10 minutos
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

module.exports = { getSession, updateSession, clearSession };
