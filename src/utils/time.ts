export function now(): number {
  return Date.now();
}

export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}
