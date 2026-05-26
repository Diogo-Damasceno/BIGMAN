/**
 * test-webhook.js — Script para testar o webhook localmente
 *
 * Uso:
 *   node test-webhook.js verify     → testa verificação GET
 *   node test-webhook.js message    → simula mensagem recebida
 *   node test-webhook.js health     → health check do servidor
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bigman_verify_2024';

const arg = process.argv[2] || 'health';

const request = (options, body = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

const tests = {
  // ─── Health check ─────────────────────────────────────────
  health: async () => {
    console.log('\n🔍 Testando health check...');
    const res = await request({ hostname: 'localhost', port: PORT, path: '/', method: 'GET' });
    console.log(`Status: ${res.status}`);
    console.log(`Resposta: ${res.body}`);
  },

  // ─── Verificação de webhook ────────────────────────────────
  verify: async () => {
    console.log('\n🔐 Testando verificação do webhook...');
    const path = `/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=BIGMAN_CHALLENGE_OK`;
    const res = await request({ hostname: 'localhost', port: PORT, path, method: 'GET' });
    console.log(`Status: ${res.status}`);
    console.log(`Challenge recebido: ${res.body}`);
    console.log(res.body === 'BIGMAN_CHALLENGE_OK' ? '✅ Webhook verificado!' : '❌ Falha na verificação');
  },

  // ─── Simular mensagem recebida ─────────────────────────────
  message: async () => {
    console.log('\n📩 Simulando mensagem de cliente...');

    const payload = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '5511999999999',
              id: 'wamid.test_' + Date.now(),
              type: 'text',
              text: { body: 'Oi! Quero agendar um corte.' }
            }]
          }
        }]
      }]
    });

    const res = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/webhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      payload
    );

    console.log(`Status: ${res.status}`);
    console.log(res.status === 200 ? '✅ Mensagem aceita pelo webhook!' : '❌ Erro no webhook');
    console.log('💡 A resposta da IA será enviada de forma assíncrona (após ~6s de delay humano)');
  },
};

(async () => {
  if (!tests[arg]) {
    console.log('Uso: node test-webhook.js [health|verify|message]');
    process.exit(1);
  }

  try {
    await tests[arg]();
  } catch (err) {
    console.error(`\n❌ Erro: ${err.message}`);
    console.error('💡 Certifique-se de que o servidor está rodando: npm run dev');
  }
})();
