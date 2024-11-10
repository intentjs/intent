import { BaseStrategy } from './baseStrategy';
import { LimiterDriver } from '../interfaces/limiterDriver';
import { GenericException } from '../../exceptions';

export class WindowCounterStrategy extends BaseStrategy {
  constructor(driver: LimiterDriver) {
    super(driver);
  }

  initializeToken = async (
    key: string,
    tokensCount: number,
    intervalInSeconds: number,
  ) => {
    WindowCounterStrategy.tokensQuota[key] = tokensCount;
    WindowCounterStrategy.tokensIntervals[key] = intervalInSeconds;
    await this.driver.setCounter(key, tokensCount);
  };

  useToken = async (key: string) => {
    if (!(await this.driver.decrementCounter(key))) {
      throw new GenericException('Cannot be called.');
    }
  };

  resetTokens = async () => {
    for (const key in BaseStrategy.tokensQuota) {
      if ((await this.driver.getCount(key)) == BaseStrategy.tokensQuota[key]) {
        continue;
      }
      setInterval(async () => {
        await this.driver.setCounter(
          key,
          WindowCounterStrategy.tokensQuota[key],
        );
      }, BaseStrategy.tokensIntervals[key] * 1000);
    }
  };

  setTimer = () => {
    this.resetTokens();
  };
}
