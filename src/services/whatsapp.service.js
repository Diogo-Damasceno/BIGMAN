/**
 * whatsapp.service.js — Integração com WhatsApp Cloud API (Meta)
 *
 * Cobre:
 *  - Envio de mensagens de texto
 *  - Indicador "digitando..." (typing indicator)
 *  - Envio de relatórios para número externo
 */

const axios = require('axios');
const logger = require('../utils/logger');

const BASE_URL = 'https://graph.facebook.com/v20.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Instância axios pré-configurada
const api = axios.create({
  baseURL: `${BASE_URL}/${PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// ─── Enviar mensagem de texto ──────────────────────────────────────────────

/**
 * Envia uma mensagem de texto simples para um número.
 * @param {string} to   - Número do destinatário (ex: 5511999999999)
 * @param {string} text - Conteúdo da mensagem
 */
const sendTextMessage = async (to, text) => {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    };

    const { data } = await api.post('/messages', payload);
    logger.info(`📤 Mensagem enviada para ${to}`);
    return data;
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    logger.error(`❌ Erro ao enviar mensagem para ${to}:`, errMsg);
    throw error;
  }
};

// ─── Indicador de digitação ────────────────────────────────────────────────

/**
 * Ativa o indicador "digitando..." no WhatsApp.
 * @param {string} to        - Número do destinatário
 * @param {string} messageId - ID da mensagem recebida (necessário pela API)
 */
const sendTypingIndicator = async (to, messageId) => {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    // Marcar como lida ativa o "digitando..." visualmente no cliente
    await api.post('/messages', payload);
    logger.debug(`⌨️  Digitando... ativado para ${to}`);
  } catch (error) {
    // Não crítico — apenas loga o aviso
    logger.warn(`⚠️  Não foi possível ativar "digitando" para ${to}:`, error.message);
  }
};

// ─── Marcar mensagem como lida ────────────────────────────────────────────

/**
 * Marca uma mensagem como lida (double-check azul).
 * @param {string} messageId
 */
const markAsRead = async (messageId) => {
  try {
    await api.post('/messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
  } catch (error) {
    logger.warn('⚠️  Erro ao marcar como lida:', error.message);
  }
};

// ─── Enviar relatório ──────────────────────────────────────────────────────

/**
 * Envia o relatório de atendimento para o número configurado em REPORT_PHONE_NUMBER.
 * @param {Object} dadosAtendimento
 * @param {string} dadosAtendimento.nome
 * @param {string} dadosAtendimento.corte
 * @param {string} dadosAtendimento.preco
 */
const sendReport = async ({ nome, corte, preco }) => {
  const reportPhone = process.env.REPORT_PHONE_NUMBER;

  if (!reportPhone) {
    logger.warn('⚠️  REPORT_PHONE_NUMBER não configurado. Relatório não enviado.');
    return;
  }

  const reportText =
    `📋 *Novo Atendimento — BIG MAN Barber Shop*\n\n` +
    `👤 *Nome:* ${nome}\n` +
    `✂️  *Corte:* ${corte}\n` +
    `💰 *Preço:* ${preco}\n\n` +
    `🕐 *Horário:* ${new Date().toLocaleString('pt-BR')}`;

  try {
    await sendTextMessage(reportPhone, reportText);
    logger.info(`📊 Relatório enviado para ${reportPhone}`);
  } catch (error) {
    logger.error('❌ Falha ao enviar relatório:', error.message);
  }
};

module.exports = { sendTextMessage, sendTypingIndicator, markAsRead, sendReport };
