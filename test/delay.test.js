const test = require('node:test');
const assert = require('node:assert/strict');
const { sleep, randomDelay } = require('../src/utils/delay');

test.describe('sleep', () => {
  test.it('resolve após o tempo determinado', async () => {
    const start = Date.now();
    await sleep(20);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 18, 'sleep deve aguardar ~20ms, passou ' + elapsed);
  });
});

test.describe('randomDelay', () => {
  test.it('respeita o intervalo [min, max] quando fixo', async () => {
    const start = Date.now();
    await randomDelay(25, 25);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 20 && elapsed < 200, 'delay fixo de 25ms, passou ' + elapsed);
  });

  test.it('retorna uma promise que resolve', async () => {
    await assert.doesNotReject(randomDelay(1, 1));
  });
});
