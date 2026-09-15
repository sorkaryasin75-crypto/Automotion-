import { workerManager } from '../workers/worker-manager.js';
import { getMainMenuKeyboard, getAdminKeyboard } from './keyboards.js';
import { Messages } from './messages.js';
import { isAdmin } from '../security/authorization.js';

export async function handleCommand(command: string, userId: number, username: string): Promise<{ text: string; reply_markup?: any } | null> {
  const cleanCmd = command.split(' ')[0]?.toLowerCase() || '';

  if (cleanCmd === '/start' || cleanCmd === '/menu') {
    workerManager.createSession(userId, username);
    return {
      text: Messages.welcome(username || 'Worker'),
      reply_markup: getMainMenuKeyboard(),
    };
  }

  if (cleanCmd === '/admin') {
    if (!isAdmin(userId)) {
      return { text: Messages.unauthorized };
    }
    return {
      text: '⚙️ **ADMIN PANEL**\n\nSelect an administration action:',
      reply_markup: getAdminKeyboard(),
    };
  }

  return null;
}
