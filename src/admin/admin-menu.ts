import { isAdmin } from '../security/authorization.js';
import { AdminService } from './admin-service.js';
import { workerManager } from '../workers/worker-manager.js';

export async function handleAdminCommand(userId: number, command: string): Promise<string | null> {
  if (!isAdmin(userId)) {
    return '⛔ Unauthorized';
  }

  if (command === '/admin' || command === 'admin') {
    return `⚙️ ADMIN PANEL\n\nWelcome administrator. Choose an option:`;
  }

  if (command === 'status') {
    return await AdminService.getSystemStatusSummary();
  }

  if (command === 'workers') {
    const workers = workerManager.getAllActiveWorkers();
    return `👥 ACTIVE WORKERS (${workers.length})\n\n` +
      workers.map(w => `• @${w.username} [${w.status}] - Completed: ${w.completedTasks}`).join('\n');
  }

  if (command === 'stopall') {
    const workers = workerManager.getAllActiveWorkers();
    for (const w of workers) {
      workerManager.updateStatus(w.telegramUserId, 'STOPPED');
      workerManager.setTask(w.telegramUserId, null);
    }
    return `⛔ All active workers have been stopped.`;
  }

  return null;
}
