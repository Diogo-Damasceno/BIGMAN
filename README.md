# 💈 BIG MAN Barber Shop — WhatsApp Bot

> Sistema completo de atendimento automático via WhatsApp com IA conversacional para a **BIG MAN Barber Shop**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)
![Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-blue?logo=google)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)
![WhatsApp](https://img.shields.io/badge/WhatsApp_Cloud_API-Meta-25D366?logo=whatsapp)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Fluxo da Conversa](#-fluxo-da-conversa)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração das APIs](#-configuração-das-apis)
  - [Meta Developer / WhatsApp Cloud API](#1-meta-developer--whatsapp-cloud-api)
  - [Google Gemini API](#2-google-gemini-api)
  - [Supabase](#3-supabase)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rodando Localmente](#-rodando-localmente)
- [Testando o Webhook](#-testando-o-webhook)
- [Deploy (Railway / Render)](#-deploy-railway--render)
- [Arquitetura](#-arquitetura)

---

## 🎯 Visão Geral

Este bot responde mensagens de clientes no WhatsApp **como se fosse um atendente humano real** da barbearia. Ele:

- Simula digitação com delay de ~6 segundos
- Usa o Google Gemini para gerar respostas naturais em português
- Mantém contexto da conversa por cliente
- Consulta o preço dos cortes no Supabase
- Envia relatório ao final de cada atendimento

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 💬 Conversa natural | Respostas humanizadas via Gemini 1.5 Flash |
| ⌨️ Simulação de digitação | Indicador "digitando..." + delay de 6s |
| 🧠 Memória de sessão | Cada cliente tem seu próprio contexto |
| 💰 Consulta de preços | Busca automática no banco Supabase |
| 📊 Relatório automático | Enviado via WhatsApp ao final do atendimento |
| 👥 Multi-cliente | Suporte a vários clientes simultâneos |
| 🔒 Segurança | Validação de token, dotenv, tratamento de erros |

---

## 🔄 Fluxo da Conversa

```
Cliente envia mensagem
        ↓
   Bot cumprimenta
   Pergunta o nome
        ↓
   Cliente informa nome
   Bot pergunta o corte
        ↓
   Cliente informa corte
   Bot consulta Supabase
   Bot informa o preço
        ↓
   Bot pergunta sobre agendamento
        ↓
   Cliente responde
   Bot finaliza o atendimento
        ↓
   📊 Relatório enviado para o número configurado
```

**Exemplo real de conversa:**

```
Cliente: Oi
Bot:     E aí! Bem-vindo à BIG MAN Barber Shop! 💈
         Sou o Big, atendente aqui da casa.
         Qual é o seu nome, parceiro?

Cliente: Carlos
Bot:     Boa, Carlos! Que corte você tá querendo hoje? ✂️

Cliente: Degradê
Bot:     Show! O Degradê tá saindo por R$ 35,00 aqui na BIG MAN. 💈
         Você quer agendar um horário?

Cliente: Sim, quero!
Bot:     Perfeito, Carlos! Tô passando seu nome na lista. 😄
         A gente te espera aqui! Qualquer dúvida é só chamar. 👊

📊 Relatório enviado:
Nome: Carlos Silva
Corte: Degradê
Preço: R$ 35,00
```

---

## 📁 Estrutura do Projeto

```
bigman-barber-whatsapp/
├── database/
│   └── schema.sql              # SQL para criar as tabelas no Supabase
├── src/
│   ├── controllers/
│   │   └── webhook.controller.js   # GET/POST do webhook Meta
│   ├── services/
│   │   ├── whatsapp.service.js     # Envio de mensagens, typing, relatório
│   │   ├── gemini.service.js       # Integração com Gemini API
│   │   ├── conversation.service.js # Motor do fluxo de atendimento
│   │   └── sessions.js             # Gerenciamento de sessões por cliente
│   ├── routes/
│   │   └── webhook.routes.js       # Rotas Express
│   ├── database/
│   │   ├── supabase.js             # Conexão com Supabase
│   │   └── cortes.repository.js    # Queries ao banco
│   ├── utils/
│   │   ├── logger.js               # Logger (Winston)
│   │   ├── delay.js                # Simulação de delay humano
│   │   └── formatter.js            # Formatação de moeda e texto
│   ├── middlewares/
│   │   └── validateEnv.js          # Validação de variáveis de ambiente
│   ├── prompts/
│   │   └── systemPrompt.js         # Prompt de sistema da IA
│   └── server.js                   # Ponto de entrada da aplicação
├── .env.example                # Modelo do arquivo de variáveis
├── .gitignore
├── package.json
└── README.md
```

---

## 📦 Requisitos

- **Node.js** 18 ou superior
- **npm** 9+
- Conta no **Meta Developer** (WhatsApp Business API)
- Conta no **Google AI Studio** (Gemini API)
- Conta no **Supabase**
- **ngrok** (para testes locais)

---

## 🚀 Instalação

```bash
# 1. Clone ou acesse o projeto
cd bigman-barber-whatsapp

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 4. Preencha o .env com suas credenciais (veja seção abaixo)
nano .env

# 5. Crie as tabelas no Supabase (veja seção Supabase)

# 6. Rode o servidor
npm run dev
```

---

## ⚙️ Configuração das APIs

### 1. Meta Developer / WhatsApp Cloud API

#### Passo a passo:

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um app do tipo **Business**
3. Adicione o produto **WhatsApp**
4. Em **WhatsApp → Configuração**:
   - Copie o **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - Gere um **Token de Acesso Permanente** → `WHATSAPP_ACCESS_TOKEN`

#### Configurar o Webhook:

1. Ainda em **WhatsApp → Configuração → Webhook**
2. Clique em **Editar**
3. Insira a URL do seu servidor:
   - Local: `https://seu-ngrok.ngrok.io/webhook`
   - Produção: `https://seu-app.railway.app/webhook`
4. Insira o **Verify Token** (mesmo valor do seu `WHATSAPP_VERIFY_TOKEN`)
5. Clique em **Verificar e Salvar**
6. Assine os eventos: marque **messages**

> ⚠️ O webhook precisa estar **acessível publicamente** (use ngrok localmente).

---

### 2. Google Gemini API

1. Acesse [aistudio.google.com](https://aistudio.google.com)
2. Clique em **Get API Key**
3. Crie uma nova chave
4. Copie a chave → `GEMINI_API_KEY`

> ✅ O modelo `gemini-1.5-flash` é gratuito com limites generosos.

---

### 3. Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute o arquivo `database/schema.sql`
3. Vá em **Project Settings → API**:
   - Copie a **Project URL** → `SUPABASE_URL`
   - Copie a **anon public key** → `SUPABASE_ANON_KEY`

---

## 🔑 Variáveis de Ambiente

Edite o arquivo `.env` com base no `.env.example`:

```env
# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxx...          # Token permanente do Meta
WHATSAPP_PHONE_NUMBER_ID=123456789012345     # ID do número de telefone
WHATSAPP_VERIFY_TOKEN=bigman_verify_2024     # Qualquer string secreta
REPORT_PHONE_NUMBER=5511999999999            # Número que recebe relatórios

# Google Gemini
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX

# Supabase
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...

# Servidor
PORT=3000
NODE_ENV=development
```

---

## 💻 Rodando Localmente

### Terminal 1 — Servidor Node:
```bash
npm run dev
```

### Terminal 2 — Túnel público com ngrok:
```bash
# Instale o ngrok: https://ngrok.com
ngrok http 3000
```

Copie a URL gerada (ex: `https://abc123.ngrok.io`) e configure no webhook da Meta.

---

## 🧪 Testando o Webhook

### Verificação (GET):
```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=bigman_verify_2024&hub.challenge=CHALLENGE_ACCEPTED"
# Resposta esperada: CHALLENGE_ACCEPTED
```

### Simulação de mensagem (POST):
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5511999999999",
            "id": "wamid.test123",
            "type": "text",
            "text": { "body": "Oi!" }
          }]
        }
      }]
    }]
  }'
```

### Health check:
```bash
curl http://localhost:3000/
```

---

## 🚢 Deploy (Railway / Render)

### Railway

1. Acesse [railway.app](https://railway.app) e crie um projeto
2. Conecte seu repositório GitHub
3. Vá em **Variables** e adicione todas as variáveis do `.env`
4. O Railway detecta Node.js automaticamente e usa `npm start`
5. Copie a URL gerada e configure no webhook da Meta

### Render

1. Acesse [render.com](https://render.com)
2. Clique em **New → Web Service**
3. Conecte o repositório
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Adicione as variáveis de ambiente
6. Faça o deploy e copie a URL

> 💡 **Dica:** No Render, use um plano pago para evitar hibernação (o webhook precisa responder em menos de 5s).

---

## 🏗️ Arquitetura

```
             Cliente (WhatsApp)
                    │
                    ▼
         ┌─────────────────────┐
         │   WhatsApp Cloud    │
         │       API (Meta)    │
         └────────┬────────────┘
                  │ POST /webhook
                  ▼
         ┌─────────────────────┐
         │   Express Server    │
         │  webhook.controller │
         └────────┬────────────┘
                  │
         ┌────────▼────────────┐
         │ conversation.service│ ◄── sessions.js (estado)
         └────┬────────────────┘
              │              │
              ▼              ▼
    ┌──────────────┐  ┌────────────────┐
    │ gemini.      │  │ supabase /     │
    │ service.js   │  │ cortes.repo.js │
    └──────────────┘  └────────────────┘
              │
              ▼
    ┌──────────────────┐
    │ whatsapp.service │ → Envia resposta + relatório
    └──────────────────┘
```

---

## 📊 Tabelas do Banco

### `cortes`
| Campo | Tipo | Descrição |
|---|---|---|
| id | SERIAL | Chave primária |
| nome | TEXT | Nome do corte (ex: "Degradê") |
| preco | NUMERIC | Preço em reais (ex: 35.00) |
| ativo | BOOLEAN | Se o corte está disponível |
| criado_em | TIMESTAMPTZ | Data de criação |

### `atendimentos`
| Campo | Tipo | Descrição |
|---|---|---|
| id | SERIAL | Chave primária |
| telefone | TEXT | Número do cliente |
| cliente_nome | TEXT | Nome informado na conversa |
| corte_nome | TEXT | Corte escolhido |
| corte_preco | TEXT | Preço cobrado |
| criado_em | TIMESTAMPTZ | Data do atendimento |

---

## 🛡️ Segurança

- Variáveis sensíveis em `.env` (nunca commitadas)
- Token de verificação do webhook
- Validação de payload da Meta
- Tratamento de erros em todos os serviços
- Sessões com TTL de 30 minutos (limpeza automática)

---

## 📄 Licença

MIT © BIG MAN Barber Shop
