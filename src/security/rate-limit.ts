import { RateLimitError } from '../utils/errors.js';

interface RateLimitRecord {
  timestamps: number[];
}

const limits = new Map<string, RateLimitRecord>();
const WINDOW_MS = 10000; // 10 seconds
const MAX_REQUESTS = 5;

export function checkRateLimit(identifier: string): void {
  const currentTime = Date.now();
  let record = limits.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    limits.set(identifier, record);
  }

  record.timestamps = record.timestamps.filter((t) => currentTime - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    throw new RateLimitError('⏳ Too many requests. Please wait and try again.');
  }

  record.timestamps.push(currentTime);
}

export function cleanupRateLimits(): void {
  const currentTime = Date.now();
  for (const [key, record] of limits.entries()) {
    record.timestamps = record.timestamps.filter((t) => currentTime - t < WINDOW_MS);
    if (record.timestamps.length === 0) {
      limits.delete(key);
    }
  }
}
