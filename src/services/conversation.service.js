/**
 * conversation.service.js — Motor principal da conversa
 *
 * Orquestra o fluxo de atendimento:
 *  1. Recebe mensagem do cliente
 *  2. Verifica sessão e etapa atual
 *  3. Decide o que fazer (buscar corte? gerar resposta? enviar relatório?)
 *  4. Atualiza sessão
 *  5. Retorna a resposta para o controller
 */

const { getSession, updateSession, clearSession } = require('./sessions');
const { generateResponse } = require('./gemini.service');
const { getCorteByNome, getAllCortes, salvarAtendimento } = require('../database/cortes.repository');
const { sendReport } = require('./whatsapp.service');
const { formatCurrency, capitalize } = require('../utils/formatter');
const logger = require('../utils/logger');

/**
 * Processa uma mensagem recebida e retorna a resposta da IA.
 *
 * @param {string} phone       - Número do remetente
 * @param {string} message     - Texto da mensagem
 * @returns {Promise<string>}  - Resposta a ser enviada
 */
const processMessage = async (phone, message) => {
  const session = getSession(phone);
  const trimmed = message.trim();

  logger.info(`📨 [${phone}] Etapa: ${session.stage} | Mensagem: "${trimmed}"`);

  // Adiciona mensagem do usuário ao histórico
  session.history.push({ role: 'user', text: trimmed });

  let response = '';
  let contextForAI = { stage: session.stage };

  // ─── ETAPA 1: Primeiro contato — pedir nome ────────────────────────
  if (session.stage === 'GREETING') {
    response = await generateResponse([], trimmed, contextForAI);
    updateSession(phone, {
      stage: 'AWAITING_NAME',
      history: session.history,
    });
  }

  // ─── ETAPA 2: Receber nome — pedir corte ──────────────────────────
  else if (session.stage === 'AWAITING_NAME') {
    const nome = capitalize(trimmed);
    contextForAI.clienteNome = nome;

    response = await generateResponse(session.history.slice(-6), trimmed, contextForAI);

    updateSession(phone, {
      stage: 'AWAITING_HAIRCUT',
      clienteNome: nome,
      history: session.history,
    });
  }

  // ─── ETAPA 3: Receber corte — buscar preço ────────────────────────
  else if (session.stage === 'AWAITING_HAIRCUT') {
    contextForAI.clienteNome = session.clienteNome;

    const corte = await getCorteByNome(trimmed);

    if (corte) {
      const precoFormatado = formatCurrency(corte.preco);
      contextForAI.corteNome = corte.nome;
      contextForAI.cortePreco = precoFormatado;

      response = await generateResponse(session.history.slice(-6), trimmed, contextForAI);

      updateSession(phone, {
        stage: 'AWAITING_SCHEDULE',
        corteNome: corte.nome,
        cortePreco: precoFormatado,
        history: session.history,
      });
    } else {
      // Corte não encontrado — pedir para escolher outro
      const todosCortes = await getAllCortes();
      const listaCortes = todosCortes.map((c) => c.nome).join(', ');

      contextForAI.corteNome = trimmed;
      contextForAI.corteNaoEncontrado = true;
      contextForAI.cortesDisponiveis = listaCortes;

      response = await generateResponse(session.history.slice(-6), trimmed, contextForAI);
      // Permanece na mesma etapa
      updateSession(phone, { history: session.history });
    }
  }

  // ─── ETAPA 4: Confirmar agendamento e fechar ──────────────────────
  else if (session.stage === 'AWAITING_SCHEDULE') {
    contextForAI.clienteNome = session.clienteNome;
    contextForAI.corteNome = session.corteNome;
    contextForAI.cortePreco = session.cortePreco;
    contextForAI.stage = 'DONE';

    response = await generateResponse(session.history.slice(-6), trimmed, contextForAI);

    // Salvar atendimento no banco
    await salvarAtendimento({
      cliente_nome: session.clienteNome,
      corte_nome: session.corteNome,
      corte_preco: session.cortePreco,
      telefone: phone,
      criado_em: new Date().toISOString(),
    });

    // Enviar relatório para o número configurado
    await sendReport({
      nome: session.clienteNome,
      corte: session.corteNome,
      preco: session.cortePreco,
    });

    // Limpar sessão após conclusão
    clearSession(phone);

    logger.info(`✅ Atendimento concluído para ${phone} (${session.clienteNome})`);
  }

  // ─── Fallback: sessão em estado desconhecido ──────────────────────
  else {
    logger.warn(`⚠️  Estado desconhecido para ${phone}: ${session.stage}`);
    clearSession(phone);
    response = 'Oi! Tive um probleminha aqui, mas já tô de volta 😅 Pode me falar seu nome?';
  }

  // Adiciona resposta da IA ao histórico
  const freshSession = getSession(phone);
  if (freshSession) {
    freshSession.history.push({ role: 'model', text: response });
    updateSession(phone, { history: freshSession.history });
  }

  return response;
};

module.exports = { processMessage };
