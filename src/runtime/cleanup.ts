import dotenv from 'dotenv';
import { taskManager } from '../tasks/task-manager.js';
import { workerManager } from '../workers/worker-manager.js';
import { cleanupRateLimits } from '../security/rate-limit.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const cleanupIntervalMs = parseInt(process.env.CLEANUP_INTERVAL_MS || '60000', 10);
let cleanupTimer: NodeJS.Timeout | null = null;

export function startRuntimeCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    try {
      taskManager.cleanupExpiredTasks();
      workerManager.cleanupStaleSessions();
      cleanupRateLimits();
      logger.debug('RUNTIME_CLEANUP', 'Periodic memory cleanup executed successfully');
    } catch (error: any) {
      logger.error('RUNTIME_CLEANUP_ERROR', error.message);
    }
  }, cleanupIntervalMs);
  logger.info('CLEANUP_STARTED', `In-memory runtime cleanup scheduled every ${cleanupIntervalMs}ms`);
}

export function stopRuntimeCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    logger.info('CLEANUP_STOPPED', 'Runtime cleanup timer stopped');
  }
}
