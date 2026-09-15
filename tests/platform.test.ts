import { workerManager } from '../src/workers/worker-manager.js';
import { taskManager } from '../src/tasks/task-manager.js';

describe('Worker & Task Manager RAM Isolation Tests', () => {
  test('creates and manages worker sessions in memory', () => {
    const userId = 999888777;
    const session = workerManager.createSession(userId, 'TestWorker');
    expect(session.telegramUserId).toBe(userId);
    expect(session.status).toBe('IDLE');

    const retrieved = workerManager.getSession(userId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.username).toBe('TestWorker');

    workerManager.removeSession(userId);
    expect(workerManager.getSession(userId)).toBeUndefined();
  });

  test('creates and transitions tasks safely', () => {
    const mockProviderTask = {
      providerTaskId: '12345',
      question: 'Solve 2 + 2',
      reward: '0.002 USD',
      expiresAt: Date.now() + 60000,
    };

    const task = taskManager.createTask(mockProviderTask);
    expect(task.status).toBe('REQUESTING');

    const assigned = taskManager.assignTask(task.id, 123);
    expect(assigned).toBe(true);

    const updated = taskManager.updateTaskState(task.id, 'DISPLAYED');
    expect(updated).toBe(true);

    const taskObj = taskManager.getTask(task.id);
    expect(taskObj?.status).toBe('DISPLAYED');
    expect(taskObj?.workerTelegramId).toBe(123);
  });
});
