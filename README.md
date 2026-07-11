# 💈 BIG MAN Barber Shop — WhatsApp Bot

Sistema completo de atendimento automático via WhatsApp com IA conversacional
para a **BIG MAN Barber Shop**.

> Node.js 18+ · Express · Google Gemini · Supabase

## Instalação

Pré-requisitos: **Node.js 18+** e contas de **Gemini** e **Supabase**.

```bash
git clone https://github.com/Diogo-Damasceno/BIGMAN.git
cd BIGMAN
npm install
cp .env.example .env      # preencha GEMINI_API_KEY e as credenciais do Supabase
```

## Uso

```bash
# producao
npm start

# desenvolvimento (reinicia sozinho)
npm run dev
```

Ao iniciar, o bot conecta ao WhatsApp (QR Code) e responde clientes usando a
IA do Gemini, persistindo dados no Supabase.

### Testes rápidos (sem subir o servidor)

```bash
npm run test:health     # checa saude do webhook
npm run test:verify     # verifica assinatura
npm run test:message    # envia mensagem de teste
```

## Requisitos

- Node.js >= 18.0.0
- Variáveis em `.env`: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY` (ver `.env.example`)

## Licença

MIT — veja `LICENSE`.
