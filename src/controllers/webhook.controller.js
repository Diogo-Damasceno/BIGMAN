/**
 * webhook.controller.js — Controller do Webhook do WhatsApp
 *
 * GET  /webhook → verificação do webhook pela Meta
 * POST /webhook → recebimento de mensagens reais
 */

const { sendTextMessage, sendTypingIndicator, markAsRead } = require('../services/whatsapp.service');
const { processMessage } = require('../services/conversation.service');
const { humanDelay } = require('../utils/delay');
const logger = require('../utils/logger');

// ─── GET /webhook — Verificação do Webhook (Meta exige) ────────────────────

const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info(`🔐 Verificação de webhook recebida. Mode: ${mode}`);

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('✅ Webhook verificado com sucesso!');
    return res.status(200).send(challenge);
  }

  logger.warn('❌ Token de verificação inválido.');
  return res.status(403).json({ error: 'Forbidden: token inválido.' });
};

// ─── POST /webhook — Recebimento de Mensagens ──────────────────────────────

const receiveMessage = async (req, res) => {
  // A Meta espera 200 imediatamente, senão reenvia o evento
  res.sendStatus(200);

  try {
    const body = req.body;

    // Valida estrutura mínima do payload
    if (!isValidPayload(body)) {
      logger.debug('📭 Payload ignorado (sem mensagem de texto válida).');
      return;
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const message = messages[0];

    // Ignorar mensagens que não sejam de texto
    if (message.type !== 'text') {
      logger.debug(`🚫 Tipo de mensagem ignorado: ${message.type}`);
      return;
    }

    const senderPhone = message.from;
    const messageId = message.id;
    const messageText = message.text?.body;

    if (!messageText || messageText.trim() === '') {
      logger.debug('📭 Mensagem vazia recebida, ignorando.');
      return;
    }

    logger.info(`📩 Mensagem recebida de ${senderPhone}: "${messageText}"`);

    // 1. Marcar como lida e ativar indicador de digitação
    await markAsRead(messageId);
    await sendTypingIndicator(senderPhone, messageId);

    // 2. Simular delay humano (~6 segundos)
    await humanDelay();

    // 3. Processar mensagem com a IA
    const response = await processMessage(senderPhone, messageText);

    // 4. Enviar resposta
    await sendTextMessage(senderPhone, response);

    logger.info(`✅ Resposta enviada para ${senderPhone}`);
  } catch (error) {
    logger.error('❌ Erro no processamento do webhook:', error);
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Valida se o payload tem a estrutura mínima esperada pela Meta.
 */
const isValidPayload = (body) => {
  return (
    body?.object === 'whatsapp_business_account' &&
    body?.entry?.[0]?.changes?.[0]?.value?.messages
  );
};

module.exports = { verifyWebhook, receiveMessage };
