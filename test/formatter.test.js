const test = require('node:test');
const assert = require('node:assert/strict');
const { formatCurrency, capitalize, sanitizePhone } = require('../src/utils/formatter');

test.describe('formatCurrency', () => {
  test.it('formata número como moeda BRL', () => {
    const out = formatCurrency(35);
    assert.match(out, /R\$/);
    assert.match(out, /35/);
  });

  test.it('usa vírgula como separador decimal (pt-BR)', () => {
    const out = formatCurrency(149.9);
    assert.ok(out.includes(','), 'esperado vírgula decimal: ' + out);
  });

  test.it('formata zero corretamente', () => {
    assert.match(formatCurrency(0), /R\$/);
  });
});

test.describe('capitalize', () => {
  test.it('capitaliza cada palavra', () => {
    assert.equal(capitalize('joao silva'), 'Joao Silva');
  });

  test.it('normaliza caixa mista', () => {
    assert.equal(capitalize('MARIA OLIVEIRA'), 'Maria Oliveira');
  });

  test.it('retorna vazio para entrada vazia', () => {
    assert.equal(capitalize(''), '');
  });

  test.it('retorna vazio para entrada nula', () => {
    assert.equal(capitalize(null), '');
    assert.equal(capitalize(undefined), '');
  });
});

test.describe('sanitizePhone', () => {
  test.it('remove tudo que não é dígito', () => {
    assert.equal(sanitizePhone('(11) 91234-5678'), '11912345678');
  });

  test.it('mantém apenas dígitos de números internacionais', () => {
    assert.equal(sanitizePhone('+55 (11) 91234-5678'), '5511912345678');
  });

  test.it('retorna string vazia se não houver dígitos', () => {
    assert.equal(sanitizePhone('---'), '');
  });
});
