import { GenericException } from '../../exceptions';
import { LimiterDriver } from '../interfaces/limiterDriver';

export class BaseStrategy {
  protected static tokensQuota = {};
  protected static tokensIntervals = {};

  constructor(protected driver: LimiterDriver) {
    this.driver = driver;
  }

  initializeToken = async (
    key: string,
    tokensCount: number,
    intervalInSeconds: number,
  ) => {
    BaseStrategy.tokensQuota[key] = tokensCount;
    BaseStrategy.tokensIntervals[key] = intervalInSeconds;
    await this.driver.setCounter(key, tokensCount, intervalInSeconds);
  };

  useToken = async (key: string) => {
    if ((await this.driver.getCount(key)) == undefined) {
      await this.initializeToken(
        key,
        BaseStrategy.tokensQuota[key] - 1,
        BaseStrategy.tokensIntervals[key],
      );
      return;
    }
    const cut = await this.driver.decrementCounter(key);
    console.log('current Count', await this.driver.getCount(key), cut);
    if (!cut) {
      throw new GenericException('Cannot be called.');
    }
  };
}
