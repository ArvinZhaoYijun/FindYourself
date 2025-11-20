export class SlidingWindowRateLimiter {
  private readonly limit: number;
  private readonly intervalMs: number;
  private readonly timestamps: number[] = [];

  constructor(limit: number, intervalMs: number) {
    this.limit = Math.max(1, limit);
    this.intervalMs = Math.max(1, intervalMs);
  }

  async acquire(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const now = Date.now();
      while (this.timestamps.length && now - this.timestamps[0]! >= this.intervalMs) {
        this.timestamps.shift();
      }

      if (this.timestamps.length < this.limit) {
        this.timestamps.push(now);
        return;
      }

      const waitTime =
        this.intervalMs - (now - this.timestamps[0]!);
      await sleep(waitTime);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}
