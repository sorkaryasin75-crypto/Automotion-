import { TaskState, isValidTransition } from './task-state.js';
import { TaskResult } from '../providers/captcha-provider.js';
import { runtimeStore } from '../runtime/runtime-store.js';

export interface Task {
  id: string;
  providerTaskId: string;
  workerTelegramId: number | null;
  status: TaskState;
  createdAt: number;
  expiresAt: number;
  answer?: string;
  attempts: number;
  reward: string;
  question: string;
}

class TaskManager {
  private tasks = new Map<string, Task>();

  public createTask(providerTask: TaskResult): Task {
    const id = `TASK_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const task: Task = {
      id,
      providerTaskId: providerTask.providerTaskId,
      workerTelegramId: null,
      status: 'REQUESTING',
      createdAt: Date.now(),
      expiresAt: providerTask.expiresAt,
      attempts: 0,
      reward: providerTask.reward || '0.001 USD',
      question: providerTask.question,
    };

    this.tasks.set(id, task);
    runtimeStore.increment('totalTasks');
    runtimeStore.increment('activeTasks');
    return task;
  }

  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public updateTaskState(id: string, nextState: TaskState): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    if (!isValidTransition(task.status, nextState)) {
      return false;
    }

    const prevState = task.status;
    task.status = nextState;

    if (nextState === 'SUCCESS') runtimeStore.increment('successfulTasks');
    if (nextState === 'INCORRECT') runtimeStore.increment('failedTasks');
    if (nextState === 'SKIPPED') runtimeStore.increment('skippedTasks');
    if (nextState === 'EXPIRED') {
      runtimeStore.increment('expiredTasks');
      runtimeStore.decrement('activeTasks');
    }

    return true;
  }

  public assignTask(id: string, telegramUserId: number): boolean {
    const task = this.tasks.get(id);
    if (!task || task.workerTelegramId !== null) return false;
    task.workerTelegramId = telegramUserId;
    return this.updateTaskState(id, 'ASSIGNED');
  }

  public cleanupExpiredTasks(): void {
    const now = Date.now();
    for (const [id, task] of this.tasks.entries()) {
      if (now > task.expiresAt && !['SUCCESS', 'SKIPPED', 'EXPIRED', 'FAILED'].includes(task.status)) {
        task.status = 'EXPIRED';
        runtimeStore.increment('expiredTasks');
        runtimeStore.decrement('activeTasks');
      }
    }
  }
}

export const taskManager = new TaskManager();
