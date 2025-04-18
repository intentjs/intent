import { Injectable } from '@intentjs/core';
import {
  Schedule,
  SchedulerRegistry,
  ScheduleRun,
} from '@intentjs/core/schedule';

@Injectable()
export class ScheduleServiceTest {
  constructor() {}

  async handle() {
    console.log('inside the handle method');
  }
}
