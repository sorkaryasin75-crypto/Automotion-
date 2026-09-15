export interface TaskResult {
  providerTaskId: string;
  question: string;
  reward?: string;
  expiresAt: number;
}

export interface SubmitResponse {
  status: 'SUCCESS' | 'INCORRECT' | 'ERROR';
  message?: string;
}

export interface CaptchaProvider {
  getBalance(): Promise<number>;
  requestTask(): Promise<TaskResult | null>;
  submitAnswer(providerTaskId: string, answer: string): Promise<SubmitResponse>;
  skipTask(providerTaskId: string): Promise<boolean>;
  getTaskStatus(providerTaskId: string): Promise<string>;
}
