import { Injectable } from '@intentjs/core';
@Injectable()
export class ScheduleServiceTest {
  constructor() {}

  async handle() {
    console.log('inside the handle method');
  }
}
