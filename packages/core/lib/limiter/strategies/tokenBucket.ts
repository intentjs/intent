import { BaseStrategy } from './baseStrategy';
import { LimiterDriver } from '../interfaces/limiterDriver';
import { GenericException } from '../../exceptions';

export class TokenBucketStrategy extends BaseStrategy {
  constructor(driver: LimiterDriver) {
    super(driver);
  }

  initializeToken = async (
    key: string,
    tokensCount: number,
    intervalInSeconds: number,
  ) => {
    TokenBucketStrategy.tokensQuota[key] = tokensCount;
    TokenBucketStrategy.tokensIntervals[key] = intervalInSeconds;
    await this.driver.setCounter(key, tokensCount);
  };

  useToken = async (key: string) => {
    if (!(await this.driver.decrementCounter(key))) {
      throw new GenericException('Cannot be called.');
    }
  };

  incrementTokens = async () => {
    for (const key in TokenBucketStrategy.tokensQuota) {
      if (
        (await this.driver.getCount(key)) ==
        TokenBucketStrategy.tokensQuota[key]
      ) {
        continue;
      }
      setInterval(async () => {
        await this.driver.incrementCounter(key);
      }, TokenBucketStrategy.tokensIntervals[key] * 1000);
    }
  };

  setTimer = () => {
    this.incrementTokens();
  };
}
