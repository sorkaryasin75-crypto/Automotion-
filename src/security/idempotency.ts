import { now } from '../utils/time.ts';

const processedUpdates = new Map<string, number>();
const TTL_MS = 60000; // 10 minutes TTL for update IDs / callbacks

export function isDuplicateUpdate(updateId: string): boolean {
  const currentTime = now();
  cleanupIdempotency(currentTime);

  if (processedUpdates.has(updateId)) {
    return true;
  }
  processedUpdates.set(updateId, currentTime);
  return false;
}

function cleanupIdempotency(currentTime: number): void {
  for (const [id, timestamp] of processedUpdates.entries()) {
    if (currentTime - timestamp > TTL_MS) {
      processedUpdates.delete(id);
    }
  }
}
