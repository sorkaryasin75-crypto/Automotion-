import { workerManager } from '../workers/worker-manager.js';
import { taskManager } from '../tasks/task-manager.js';
import { TwoCaptchaProvider } from '../providers/twocaptcha-provider.js';
import { getMainMenuKeyboard, getTaskActionKeyboard, getSuccessKeyboard, getIncorrectKeyboard, getBalanceKeyboard, getAdminKeyboard } from './keyboards.js';
import { Messages } from './messages.js';
import { isAdmin } from '../security/authorization.js';
import { AdminService } from '../admin/admin-service.js';
import dotenv from 'dotenv';

dotenv.config();
const provider = new TwoCaptchaProvider(process.env.CAPTCHA_PROVIDER_API_KEY || '');

export async function handleCallbackQuery(callbackData: string, userId: number, username: string): Promise<{ text: string; reply_markup?: any }> {
  let session = workerManager.getSession(userId);
  if (!session) {
    session = workerManager.createSession(userId, username);
  }

  switch (callbackData) {
    case 'main_menu':
      return { text: Messages.welcome(username), reply_markup: getMainMenuKeyboard() };

    case 'start_work': {
      if (session.currentTaskId) {
        const activeTask = taskManager.getTask(session.currentTaskId);
        if (activeTask && activeTask.status !== 'SUCCESS' && activeTask.status !== 'EXPIRED') {
          return {
            text: Messages.taskDisplayed(activeTask.id, activeTask.question),
            reply_markup: getTaskActionKeyboard(),
          };
        }
      }

      workerManager.updateStatus(userId, 'WAITING_FOR_ANSWER');
      const providerTask = await provider.requestTask();
      if (!providerTask) {
        return {
          text: '⏳ No tasks available right now. Please try again shortly.',
          reply_markup: getMainMenuKeyboard(),
        };
      }

      const newTask = taskManager.createTask(providerTask);
      taskManager.assignTask(newTask.id, userId);
      workerManager.setTask(userId, newTask.id);

      return {
        text: Messages.taskDisplayed(newTask.id, newTask.question),
        reply_markup: getTaskActionKeyboard(),
      };
    }

    case 'current_task': {
      if (!session.currentTaskId) {
        return { text: '❌ You do not have any active task assigned.', reply_markup: getMainMenuKeyboard() };
      }
      const task = taskManager.getTask(session.currentTaskId);
      if (!task) {
        return { text: '❌ Active task not found.', reply_markup: getMainMenuKeyboard() };
      }
      return {
        text: Messages.taskDisplayed(task.id, task.question),
        reply_markup: getTaskActionKeyboard(),
      };
    }

    case 'balance': {
      try {
        const balance = await provider.getBalance();
        return {
          text: `💰 **BALANCE**\n\nCurrent Balance: $${balance}\nProvider: Connected\nLast Checked: ${new Date().toISOString()}`,
          reply_markup: getBalanceKeyboard(),
        };
      } catch (e) {
        return {
          text: `💰 **BALANCE**\n\nUnable to fetch balance from provider API.`,
          reply_markup: getBalanceKeyboard(),
        };
      }
    }

    case 'statistics': {
      return {
        text: `📊 **STATISTICS**\n\n• Completed: ${session.completedTasks}\n• Failed: ${session.failedTasks}\n• Skipped: ${session.skippedTasks}\n• Retries: ${session.retryCount}`,
        reply_markup: getMainMenuKeyboard(),
      };
    }

    case 'session': {
      return {
        text: `📜 **SESSION INFO**\n\nSession ID: \`${session.sessionId}\`\nStatus: ${session.status}\nStarted At: ${new Date(session.startedAt).toLocaleString()}`,
        reply_markup: getMainMenuKeyboard(),
      };
    }

    case 'stop_work': {
      workerManager.updateStatus(userId, 'STOPPED');
      workerManager.setTask(userId, null);
      return {
        text: `⛔ Work stopped. You can resume at any time.`,
        reply_markup: getMainMenuKeyboard(),
      };
    }

    case 'skip_task': {
      if (session.currentTaskId) {
        const task = taskManager.getTask(session.currentTaskId);
        if (task) {
          taskManager.updateTaskState(task.id, 'SKIPPED');
          await provider.skipTask(task.providerTaskId);
          session.skippedTasks++;
        }
        workerManager.setTask(userId, null);
      }
      return { text: `⏭ Task skipped. Press Start Work for a new task.`, reply_markup: getMainMenuKeyboard() };
    }

    case 'admin_status': {
      if (!isAdmin(userId)) return { text: Messages.unauthorized };
      const summary = await AdminService.getSystemStatusSummary();
      return { text: summary, reply_markup: getAdminKeyboard() };
    }

    case 'admin_workers': {
      if (!isAdmin(userId)) return { text: Messages.unauthorized };
      const workers = workerManager.getAllActiveWorkers();
      return {
        text: `👥 **ACTIVE WORKERS (${workers.length})**\n\n` + workers.map(w => `• @${w.username} [${w.status}]`).join('\n'),
        reply_markup: getAdminKeyboard(),
      };
    }

    case 'admin_stopall': {
      if (!isAdmin(userId)) return { text: Messages.unauthorized };
      const workers = workerManager.getAllActiveWorkers();
      for (const w of workers) {
        workerManager.updateStatus(w.telegramUserId, 'STOPPED');
        workerManager.setTask(w.telegramUserId, null);
      }
      return { text: `⛔ All active workers stopped successfully.`, reply_markup: getAdminKeyboard() };
    }

    default:
      return { text: `⚠️ Unhandled callback action.`, reply_markup: getMainMenuKeyboard() };
  }
}
