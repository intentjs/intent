import { GenericException } from '../../exceptions';
import { LimiterDriver } from '../interfaces/limiterDriver';
import { BaseStrategy } from './baseStrategy';

export class SlidingWindowCounter extends BaseStrategy {
  constructor(driver: LimiterDriver) {
    super(driver);
  }

  initializeToken = async (
    key: string,
    tokensCount: number,
    intervalInSeconds: number,
  ) => {
    SlidingWindowCounter.tokensQuota[key] = tokensCount;
    SlidingWindowCounter.tokensIntervals[key] = intervalInSeconds;
    await this.driver.setCounter(key, tokensCount);
  };

  useToken = async (key: string) => {
    const current = new Date().valueOf();
    await this.driver.delScoresLessThan(key, current);

    if (
      (await this.driver.getScoresCount(key)) >= BaseStrategy.tokensQuota[key]
    ) {
      throw new GenericException('Cannot be called.');
    }
    await this.driver.addNewScore(key, current);
  };

  setTimer = () => {
    // this.setTokens();
  };
}
