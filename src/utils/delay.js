/**
 * delay.js — Funções de espera para simular comportamento humano
 */

/**
 * Aguarda um número fixo de milissegundos.
 * @param {number} ms - Tempo em milissegundos
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Aguarda entre min e max segundos (humaniza o bot).
 * @param {number} minMs
 * @param {number} maxMs
 */
const randomDelay = (minMs = 4000, maxMs = 8000) => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(ms);
};

/**
 * Delay padrão de ~6s simulando digitação real.
 */
const humanDelay = () => randomDelay(5000, 7000);

module.exports = { sleep, randomDelay, humanDelay };
