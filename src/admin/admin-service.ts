import { runtimeStore, SystemStats } from '../runtime/runtime-store.js';
import { workerManager } from '../workers/worker-manager.js';
import { TwoCaptchaProvider } from '../providers/twocaptcha-provider.js';
import dotenv from 'dotenv';

dotenv.config();
const provider = new TwoCaptchaProvider(process.env.CAPTCHA_PROVIDER_API_KEY || '');

export class AdminService {
  public static async getSystemStatusSummary(): Promise<string> {
    const stats: SystemStats = runtimeStore.getStats();
    let balance = 'Unavailable';
    try {
      const b = await provider.getBalance();
      balance = `$${b}`;
    } catch (e) {
      balance = 'Error fetching balance';
    }

    return `📊 SYSTEM STATUS\n\n` +
      `• Total Tasks: ${stats.totalTasks}\n` +
      `• Successful: ${stats.successfulTasks}\n` +
      `• Failed/Incorrect: ${stats.failedTasks}\n` +
      `• Skipped: ${stats.skippedTasks}\n` +
      `• Expired: ${stats.expiredTasks}\n` +
      `• Active Workers: ${stats.activeWorkers}\n` +
      `• Active Tasks: ${stats.activeTasks}\n` +
      `• Provider Balance: ${balance}\n` +
      `• Avg Response Time: ${stats.averageResponseTime}ms\n\n` +
      `⚠️ Note: All states are RAM-only and reset on Railway restarts.`;
  }
}
