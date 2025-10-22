interface RateEntry {
  date: string;
  count: number;
}

export class DailyRateLimiter {
  private readonly counters = new Map<string, RateEntry>();

  constructor(private readonly limit: number) {}

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getEntry(key: string): RateEntry {
    const today = this.getToday();
    const entry = this.counters.get(key);

    if (!entry || entry.date !== today) {
      const freshEntry = { date: today, count: 0 };
      this.counters.set(key, freshEntry);
      return freshEntry;
    }

    return entry;
  }

  canConsume(key: string): boolean {
    const entry = this.getEntry(key);
    return entry.count < this.limit;
  }

  consume(key: string) {
    const entry = this.getEntry(key);
    if (entry.count >= this.limit) {
      throw new Error('Rate limit reached');
    }
    entry.count += 1;
    this.counters.set(key, entry);
  }

  getRemaining(key: string): number {
    const entry = this.getEntry(key);
    return Math.max(this.limit - entry.count, 0);
  }

  reset() {
    this.counters.clear();
  }
}

export const weatherRateLimiter = new DailyRateLimiter(500);
