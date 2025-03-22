import { DriverJob } from '../strategy/index.js';

export class RedisJob extends DriverJob {
  public getId(): string {
    return '';
  }

  public getMessage(): string {
    return this.data.message;
  }
}

export class SqsJob extends DriverJob {
  public getId(): string {
    return '';
  }

  public getMessage(): string {
    return this.data.Body;
  }
}

export class DbJob extends DriverJob {
  public getId(): string {
    return this.data.id;
  }

  public getMessage(): string {
    return this.data.payload;
  }
}
