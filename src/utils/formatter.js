/**
 * formatter.js — Funções de formatação
 */

/**
 * Formata um número para o padrão brasileiro de moeda.
 * @param {number} value
 * @returns {string} ex: "R$ 35,00"
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Capitaliza a primeira letra de cada palavra.
 * @param {string} str
 */
const capitalize = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Sanitiza o número de telefone para o formato da API (apenas dígitos).
 * @param {string} phone
 */
const sanitizePhone = (phone) => phone.replace(/\D/g, '');

module.exports = { formatCurrency, capitalize, sanitizePhone };
