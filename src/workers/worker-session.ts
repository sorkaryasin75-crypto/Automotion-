export type WorkerStatus =
  | 'IDLE'
  | 'WORKING'
  | 'WAITING_FOR_ANSWER'
  | 'SUBMITTING'
  | 'STOPPED';

export interface WorkerSession {
  telegramUserId: number;
  username: string;
  sessionId: string;
  status: WorkerStatus;
  currentTaskId: string | null;
  startedAt: number;
  lastActivity: number;
  completedTasks: number;
  failedTasks: number;
  skippedTasks: number;
  retryCount: number;
}
