export type BudgetKey = 'frame' | 'post' | 'compute' | 'materials';

export interface BudgetConfig {
  frameMs: number;
  postChainMs: number;
  computeMs: number;
}

export interface BudgetSample {
  key: BudgetKey;
  duration: number;
  timestamp: number;
}

const defaultBudget: BudgetConfig = {
  frameMs: 16.6,
  postChainMs: 5,
  computeMs: 4
};

export class BudgetTracker {
  private readonly budget: BudgetConfig;
  private readonly history: BudgetSample[] = [];

  constructor(budget: Partial<BudgetConfig> = {}) {
    this.budget = { ...defaultBudget, ...budget };
  }

  record(key: BudgetKey, duration: number) {
    this.history.push({ key, duration, timestamp: performance.now() });
  }

  public getBudget(key: BudgetKey): number {
    switch (key) {
      case 'frame':
        return this.budget.frameMs;
      case 'post':
        return this.budget.postChainMs;
      case 'compute':
        return this.budget.computeMs;
      case 'materials':
      default:
        return this.budget.frameMs / 2;
    }
  }

  public latest(key: BudgetKey): BudgetSample | undefined {
    for (let i = this.history.length - 1; i >= 0; i -= 1) {
      if (this.history[i].key === key) return this.history[i];
    }
    return undefined;
  }

  public isWithinBudget(key: BudgetKey, duration: number): boolean {
    return duration <= this.getBudget(key);
  }

  public summarize(windowMs = 1000) {
    const cutoff = performance.now() - windowMs;
    const filtered = this.history.filter((entry) => entry.timestamp >= cutoff);
    const totals = new Map<BudgetKey, { total: number; count: number }>();
    filtered.forEach((entry) => {
      const record = totals.get(entry.key) ?? { total: 0, count: 0 };
      record.total += entry.duration;
      record.count += 1;
      totals.set(entry.key, record);
    });

    return Array.from(totals.entries()).map(([key, { total, count }]) => ({
      key,
      avg: count > 0 ? total / count : 0,
      budget: this.getBudget(key),
      count
    }));
  }
}

export const globalBudgetTracker = new BudgetTracker();



