export interface SystemStats {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  skippedTasks: number;
  expiredTasks: number;
  activeWorkers: number;
  activeTasks: number;
  providerErrors: number;
  averageResponseTime: number;
}

class RuntimeStore {
  private stats: SystemStats = {
    totalTasks: 0,
    successfulTasks: 0,
    failedTasks: 0,
    skippedTasks: 0,
    expiredTasks: 0,
    activeWorkers: 0,
    activeTasks: 0,
    providerErrors: 0,
    averageResponseTime: 0,
  };

  private responseTimes: number[] = [];

  public getStats(): SystemStats {
    return { ...this.stats };
  }

  public increment(metric: keyof SystemStats, amount: number = 1): void {
    if (typeof this.stats[metric] === 'number') {
      (this.stats[metric] as number) += amount;
    }
  }

  public decrement(metric: keyof SystemStats, amount: number = 1): void {
    if (typeof this.stats[metric] === 'number' && (this.stats[metric] as number) >= amount) {
      (this.stats[metric] as number) -= amount;
    }
  }

  public recordResponseTime(durationMs: number): void {
    this.responseTimes.push(durationMs);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    this.stats.averageResponseTime = Math.round(sum / this.responseTimes.length);
  }
}

export const runtimeStore = new RuntimeStore();
