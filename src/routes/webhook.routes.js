/**
 * webhook.routes.js — Rotas do Webhook WhatsApp
 */

const express = require('express');
const router = express.Router();

const { verifyWebhook, receiveMessage } = require('../controllers/webhook.controller');

// GET  /webhook → verificação pela Meta Developer
router.get('/', verifyWebhook);

// POST /webhook → recebimento de mensagens em tempo real
router.post('/', receiveMessage);

module.exports = router;
