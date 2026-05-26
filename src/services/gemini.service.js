/**
 * gemini.service.js — Integração com Google Gemini API
 *
 * Gerencia o histórico de conversa por sessão e gera respostas
 * humanizadas para os clientes da BIG MAN Barber Shop.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('../prompts/systemPrompt');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Gera uma resposta da IA baseada no histórico da sessão.
 *
 * @param {Array}  history    - Histórico de mensagens [{role, parts}]
 * @param {string} userMessage - Última mensagem do cliente
 * @param {Object} context    - Contexto extra (nome, corte, preço, etc.)
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
const generateResponse = async (history, userMessage, context = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: buildSystemInstruction(context),
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.85,       // criatividade moderada: natural mas coerente
        topP: 0.9,
        topK: 40,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text().trim();

    logger.debug(`🤖 Gemini respondeu: "${response.substring(0, 80)}..."`);
    return response;
  } catch (error) {
    logger.error('❌ Erro na Gemini API:', error.message);
    // Resposta fallback humanizada
    return 'Eita, deu um problema aqui do meu lado 😅 Me manda de novo, por favor!';
  }
};

/**
 * Monta a instrução de sistema com contexto dinâmico da sessão.
 * @param {Object} context
 */
const buildSystemInstruction = (context) => {
  let extra = '';

  if (context.clienteNome) {
    extra += `\nO nome do cliente é: ${context.clienteNome}.`;
  }

  if (context.corteNome && context.cortePreco) {
    extra += `\nO cliente escolheu o corte: ${context.corteNome} que custa ${context.cortePreco}.`;
    extra += `\nInforme o preço de forma natural e pergunte se deseja agendar.`;
  } else if (context.corteNome && context.corteNaoEncontrado) {
    extra += `\nO cliente mencionou "${context.corteNome}", mas esse corte não foi encontrado no cardápio.`;
    extra += `\nPeça ao cliente para informar um dos cortes disponíveis: ${context.cortesDisponiveis || 'Degradê, Social, Americano, Navalhado, Barba'}.`;
  }

  if (context.stage === 'AWAITING_SCHEDULE') {
    extra += `\nO preço já foi informado. Agora pergunte se deseja agendar um horário.`;
  }

  if (context.stage === 'DONE') {
    extra += `\nO atendimento foi finalizado. Agradeça ao cliente e deseje uma boa semana.`;
  }

  return SYSTEM_PROMPT + extra;
};

module.exports = { generateResponse };
