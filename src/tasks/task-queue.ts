import { TaskResult } from '../providers/captcha-provider.js';

export class TaskQueue {
  private queue: TaskResult[] = [];

  public push(task: TaskResult): void {
    this.queue.push(task);
  }

  public pop(): TaskResult | undefined {
    return this.queue.shift();
  }

  public size(): number {
    return this.queue.length;
  }

  public clear(): void {
    this.queue = [];
  }
}

export const taskQueue = new TaskQueue();
