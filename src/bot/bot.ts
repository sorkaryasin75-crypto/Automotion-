import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { handleCommand } from './commands.js';
import { handleCallbackQuery } from './callbacks.js';
import { workerManager } from '../workers/worker-manager.js';
import { taskManager } from '../tasks/task-manager.js';
import { TwoCaptchaProvider } from '../providers/twocaptcha-provider.js';
import { getTaskActionKeyboard, getSuccessKeyboard, getIncorrectKeyboard } from './keyboards.js';
import { Messages } from './messages.js';
import { checkRateLimit } from '../security/rate-limit.js';
import { isDuplicateUpdate } from '../security/idempotency.js';
import { logger } from '../utils/logger.js';

dotenv.config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const provider = new TwoCaptchaProvider(process.env.CAPTCHA_PROVIDER_API_KEY || '');

export async function processTelegramUpdate(update: any): Promise<void> {
  const updateId = String(update.update_id);
  if (isDuplicateUpdate(updateId)) {
    logger.debug('DUPLICATE_UPDATE', `Skipping duplicate update ID ${updateId}`);
    return;
  }

  try {
    if (update.callback_query) {
      const cb = update.callback_query;
      const userId = cb.from.id;
      const username = cb.from.username || cb.from.first_name || 'Worker';

      checkRateLimit(`callback_${userId}`);
      await answerCallbackQuery(cb.id);

      const response = await handleCallbackQuery(cb.data, userId, username);
      await sendTelegramMessage(cb.message.chat.id, response.text, response.reply_markup);
    } else if (update.message) {
      const msg = update.message;
      const userId = msg.from.id;
      const username = msg.from.username || msg.from.first_name || 'Worker';

      checkRateLimit(`message_${userId}`);

      if (msg.text && msg.text.startsWith('/')) {
        const response = await handleCommand(msg.text, userId, username);
        if (response) {
          await sendTelegramMessage(msg.chat.id, response.text, response.reply_markup);
        }
      } else {
        // Handle human manual answer input (ForceReply scenario)
        const session = workerManager.getSession(userId);
        if (session && session.currentTaskId) {
          const task = taskManager.getTask(session.currentTaskId);
          if (task && task.status === 'WAITING_FOR_HUMAN') {
            task.answer = msg.text;
            taskManager.updateTaskState(task.id, 'ANSWER_SUBMITTED');
            taskManager.updateTaskState(task.id, 'VALIDATING');

            const submitRes = await provider.submitAnswer(task.providerTaskId, msg.text);

            if (submitRes.status === 'SUCCESS') {
              taskManager.updateTaskState(task.id, 'SUCCESS');
              session.completedTasks++;
              workerManager.setTask(userId, null);

              await sendTelegramMessage(
                msg.chat.id,
                Messages.success(task.id, task.reward),
                getSuccessKeyboard()
              );
            } else {
              taskManager.updateTaskState(task.id, 'INCORRECT');
              session.failedTasks++;
              session.retryCount++;

              await sendTelegramMessage(
                msg.chat.id,
                Messages.incorrect(submitRes.message),
                getIncorrectKeyboard()
              );
            }
          }
        }
      }
    }
  } catch (error: any) {
    logger.error('TELEGRAM_UPDATE_ERROR', error.message);
  }
}

async function answerCallbackQuery(callbackQueryId: string): Promise<void> {
  if (!TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

export async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any, forceReply: boolean = false): Promise<void> {
  if (!TOKEN) return;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  } else if (forceReply) {
    body.reply_markup = { force_reply: true, selective: true };
  }

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
