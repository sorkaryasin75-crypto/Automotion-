import fetch from 'node-fetch';
import { CaptchaProvider, TaskResult, SubmitResponse } from './captcha-provider.js';
import { ProviderError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { runtimeStore } from '../runtime/runtime-store.js';

export class TwoCaptchaProvider implements CaptchaProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getBalance(): Promise<number> {
    try {
      const url = `https://2captcha.com/res.php?key=${this.apiKey}&action=getbalance&json=1`;
      const res = await fetch(url);
      const data: any = await res.json();
      if (data.status === 1) {
        return parseFloat(data.request);
      }
      runtimeStore.increment('providerErrors');
      throw new ProviderError(`2Captcha balance error: ${data.request}`);
    } catch (error: any) {
      runtimeStore.increment('providerErrors');
      logger.error('PROVIDER_BALANCE_FAILED', error.message);
      throw new ProviderError(`Failed to fetch balance: ${error.message}`);
    }
  }

  public async requestTask(): Promise<TaskResult | null> {
    try {
      // Official Documented API integration for text / human-assisted CAPTCHA or task polling
      const url = `https://2captcha.com/res.php?key=${this.apiKey}&action=get&json=1`;
      const res = await fetch(url);
      const data: any = await res.json();

      if (data.status === 0 && data.request === 'CAPCHA_NOT_READY') {
        return null;
      }

      if (data.status === 1) {
        return {
          providerTaskId: data.id || String(Date.now()),
          question: data.request || 'Please manually solve the provided challenge.',
          reward: '0.001 USD',
          expiresAt: Date.now() + 120000, // 2 minutes expiration
        };
      }

      return null;
    } catch (error: any) {
      runtimeStore.increment('providerErrors');
      logger.error('PROVIDER_REQUEST_TASK_FAILED', error.message);
      return null;
    }
  }

  public async submitAnswer(providerTaskId: string, answer: string): Promise<SubmitResponse> {
    try {
      const url = `https://2captcha.com/res.php?key=${this.apiKey}&action=send&id=${providerTaskId}&value=${encodeURIComponent(answer)}&json=1`;
      const res = await fetch(url);
      const data: any = await res.json();

      if (data.status === 1) {
        return { status: 'SUCCESS' };
      }

      return { status: 'INCORRECT', message: data.request };
    } catch (error: any) {
      runtimeStore.increment('providerErrors');
      logger.error('PROVIDER_SUBMIT_FAILED', error.message);
      return { status: 'ERROR', message: error.message };
    }
  }

  public async skipTask(providerTaskId: string): Promise<boolean> {
    try {
      const url = `https://2captcha.com/res.php?key=${this.apiKey}&action=reportbad&id=${providerTaskId}&json=1`;
      await fetch(url);
      return true;
    } catch (error: any) {
      logger.error('PROVIDER_SKIP_FAILED', error.message);
      return false;
    }
  }

  public async getTaskStatus(providerTaskId: string): Promise<string> {
    return 'PENDING';
  }
}
