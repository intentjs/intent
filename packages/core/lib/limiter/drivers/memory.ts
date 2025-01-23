import { LimiterDriver } from '../interfaces/limiterDriver';

export class MemoryDriver implements LimiterDriver {
  private static keyCounts = {};
  private static keyScores = {};
  private options = { prefix: 'in-memory-keys' };

  async setCounter(
    key: string,
    value: number,
    ttlInSec?: number,
  ): Promise<any> {
    await this.set(key, value, ttlInSec);
  }

  async incrementCounter(key: string): Promise<void> {
    MemoryDriver.keyCounts[this.storeKey(key)] += 1;
  }

  async decrementCounter(key: string): Promise<boolean> {
    if ([undefined, 0].includes(await this.getCount(key))) {
      return false;
    }
    MemoryDriver.keyCounts[this.storeKey(key)] -= 1;
    return true;
  }

  async delScoresLessThan(key: string, val: number): Promise<void> {
    let ele = MemoryDriver.keyScores[this.storeKey(key)]?.[0];
    if (!ele) return;
    while (ele && ele < val) {
      delete MemoryDriver.keyScores[this.storeKey(key)]?.[0];
      ele = MemoryDriver.keyScores[this.storeKey(key)]?.[0];
    }
  }

  async addNewScore(key: string, val: number) {
    if (!MemoryDriver.keyScores[this.storeKey(key)]) {
      MemoryDriver.keyScores[this.storeKey(key)] = [];
    }
    return MemoryDriver.keyScores[this.storeKey(key)].append(val);
  }

  async getScoresCount(key: string): Promise<number> {
    return MemoryDriver.keyScores[this.storeKey(key)]?.length ?? 0;
  }
  async getCount(key: string): Promise<number> {
    return MemoryDriver.keyCounts[this.storeKey(key)];
  }

  private async get(key: string): Promise<any> {
    const value = MemoryDriver.keyCounts[this.storeKey(key)];
    if (!value) return null;
    return value;
  }

  private async set(
    key: string,
    value: number,
    ttlInSec?: number,
  ): Promise<boolean> {
    const redisKey = this.storeKey(key);
    MemoryDriver.keyCounts[redisKey] = value;
    if (ttlInSec) {
      setTimeout(() => {
        delete MemoryDriver.keyCounts[redisKey];
      }, ttlInSec * 1000);
    }
    return true;
  }

  private storeKey(key: string): string {
    return `${this.options.prefix}:::${key}`;
  }
}
