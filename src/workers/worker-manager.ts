import { WorkerSession, WorkerStatus } from './worker-session.js';
import { runtimeStore } from '../runtime/runtime-store.js';

class WorkerManager {
  private sessions = new Map<number, WorkerSession>();

  public getSession(telegramUserId: number): WorkerSession | undefined {
    return this.sessions.get(telegramUserId);
  }

  public createSession(telegramUserId: number, username: string): WorkerSession {
    let session = this.sessions.get(telegramUserId);
    if (!session) {
      session = {
        telegramUserId,
        username,
        sessionId: `SESSION_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: 'IDLE',
        currentTaskId: null,
        startedAt: Date.now(),
        lastActivity: Date.now(),
        completedTasks: 0,
        failedTasks: 0,
        skippedTasks: 0,
        retryCount: 0,
      };
      this.sessions.set(telegramUserId, session);
      runtimeStore.increment('activeWorkers');
    }
    return session;
  }

  public updateStatus(telegramUserId: number, status: WorkerStatus): void {
    const session = this.sessions.get(telegramUserId);
    if (session) {
      session.status = status;
      session.lastActivity = Date.now();
    }
  }

  public setTask(telegramUserId: number, taskId: string | null): void {
    const session = this.sessions.get(telegramUserId);
    if (session) {
      session.currentTaskId = taskId;
      session.lastActivity = Date.now();
    }
  }

  public removeSession(telegramUserId: number): void {
    if (this.sessions.has(telegramUserId)) {
      this.sessions.delete(telegramUserId);
      runtimeStore.decrement('activeWorkers');
    }
  }

  public getAllActiveWorkers(): WorkerSession[] {
    return Array.from(this.sessions.values());
  }

  public cleanupStaleSessions(): void {
    const now = Date.now();
    const STALE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours inactive
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > STALE_TIMEOUT_MS) {
        this.sessions.delete(id);
        runtimeStore.decrement('activeWorkers');
      }
    }
  }
}

export const workerManager = new WorkerManager();
