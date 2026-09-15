import { IncomingMessage, ServerResponse } from 'http';
import { processTelegramUpdate } from '../bot/bot.js';
import dotenv from 'dotenv';

dotenv.config();
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

export async function handleWebhook(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
  if (WEBHOOK_SECRET && secretHeader !== WEBHOOK_SECRET) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden webhook secret' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const update = JSON.parse(body);
      // Fast acknowledgment to Telegram
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));

      // Process update asynchronously
      await processTelegramUpdate(update);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
    }
  });
}
