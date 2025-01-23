import { LimiterDriver } from './interfaces/limiterDriver';
import { BaseStrategy } from './strategies/baseStrategy';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/service';
import {
  DriversMap,
  LimiterDriverType,
} from './interfaces/options';

@Injectable()
export class Limiter {
  private static driver: LimiterDriver;
  private static strategy: BaseStrategy;
  constructor(private config: ConfigService) {
    const options = this.config.get('limiter');
    if(!options) return
    switch (options.driver) {
      case LimiterDriverType.REDIS: {
        Limiter.driver = new DriversMap[LimiterDriverType.REDIS](
          options.connection,
        );
      }
      default: {
        Limiter.driver = new DriversMap[LimiterDriverType.IN_MEMORY]();
      }
    }
    Limiter.strategy = new BaseStrategy(Limiter.driver);
  }

  static initializeToken = (
    key: string,
    tokensCount: number,
    intervalInSeconds: number,
  ) => {
    Limiter.strategy.initializeToken(key, tokensCount, intervalInSeconds);
  };

  static useToken = (key: string) => {
    Limiter.strategy.useToken(key);
  };
}
