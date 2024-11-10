export interface LimiterDriver {
  setCounter(key: string, value: number, ttlInSec?: number): Promise<any>;
  incrementCounter(key: string): Promise<any>;
  decrementCounter(key: string): Promise<any>;
  delScoresLessThan(key: string, val: number): Promise<any>;
  addNewScore(key: string, val: number): void;
  getScoresCount(key: string): Promise<number>;
  getCount(key: string): Promise<number>;
}
