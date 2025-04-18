import { CronJob, validateCronExpression } from 'cron';
import { Dispatch, Message } from '../queue/index.js';
import { SchedulerRegistry } from './metadata.js';
import { ulid } from 'ulid';
import {
  HandlerType,
  ScheduleHandler,
  ScheduleOptions,
} from './options/interface.js';
import { CommandRunner } from '../console/runner.js';
import { ScheduleRun } from './schedule-run.js';

export class Schedule {
  private scheduleName: ScheduleOptions['name'];
  private purposeText: ScheduleOptions['purpose'];
  private handler: ScheduleHandler;
  private cronJob: CronJob;
  private tz: ScheduleOptions['timezone'];
  private cronExpression: string;
  private beforeFunc: any;
  private afterFunc: any;
  private onErrorFunc: (e: Error) => void | Promise<void>;
  private autoStart: boolean;

  constructor(handler: ScheduleHandler) {
    this.purposeText = '';
    this.scheduleName = '';
    this.cronJob = null;
    this.cronExpression = '';
    this.handler = handler;
    console.log(this.handler);
    this.autoStart = true;
  }

  static command(command: string): Schedule {
    const schedule = new Schedule({
      type: HandlerType.COMMAND,
      value: command,
    });

    return schedule;
  }

  static job(job: Message): Schedule {
    const schedule = new Schedule({ type: HandlerType.JOB, value: job });
    return schedule;
  }

  static call(fun: Function): Schedule {
    const schedule = new Schedule({ type: HandlerType.FUNCTION, value: fun });
    return schedule;
  }

  static exec(command: string): Schedule {
    const schedule = new Schedule({ type: HandlerType.SHELL, value: command });
    return schedule;
  }

  name(name: ScheduleOptions['name']): this {
    this.scheduleName = name;
    return this;
  }

  purpose(purpose: ScheduleOptions['purpose']): this {
    this.purposeText = purpose;
    return this;
  }

  timezone(tz: ScheduleOptions['timezone']): this {
    this.tz = tz;
    return this;
  }

  cron(expression: string): void {
    validateCronExpression(expression);
    this.cronExpression = expression;
    this.makeCronJob();
  }

  noAutoStart(): this {
    this.autoStart = false;
    return this;
  }

  utcOffset(offset: string): this {
    return this;
  }

  at(time: string): void {
    this.cron(ScheduleRun.dailyAt(time));
  }

  everySecond(): void {
    this.cron(ScheduleRun.everySecond);
  }

  everyTwoSeconds(): void {
    this.cron(ScheduleRun.everyTwoSeconds);
  }

  everyFiveSeconds(): void {
    this.cron(ScheduleRun.everyFiveSeconds);
  }

  everyTenSeconds() {
    this.cron(ScheduleRun.everyTenSeconds);
  }

  everyFifteenSeconds() {
    this.cron(ScheduleRun.everyFifteenSeconds);
  }

  everyTwentySeconds() {
    this.cron(ScheduleRun.everyTwentySeconds);
  }

  everyThirtySeconds() {
    this.cron(ScheduleRun.everyThirtySeconds);
  }

  everyMinute() {
    this.cron(ScheduleRun.everyMinute);
  }

  everyTwoMinutes() {
    this.cron(ScheduleRun.everyTwoMinutes);
  }

  everyThreeMinutes() {
    this.cron(ScheduleRun.everyThreeMinutes);
  }

  everyFourMinutes() {
    this.cron(ScheduleRun.everyFourMinutes);
  }

  everyFiveMinutes() {
    this.cron(ScheduleRun.everyFourMinutes);
  }

  everyTenMinutes() {
    this.cron(ScheduleRun.everyTenMinutes);
  }

  everyFifteenMinutes() {
    this.cron(ScheduleRun.everyFifteenMinutes);
  }

  everyThirtyMinutes() {
    this.cron(ScheduleRun.everyThirtyMinutes);
  }

  hourly() {
    this.cron(ScheduleRun.hourly);
  }

  hourlyAt(min: number) {
    this.cron(ScheduleRun.hourlyAt(min));
  }

  everyOddHour(mins: number = 0) {
    this.cron(ScheduleRun.everyOddHour(mins));
  }

  everyTwoHours(mins: number = 0) {
    this.cron(ScheduleRun.everyTwoHours(mins));
  }

  everyThreeHours(mins: number = 0) {
    this.cron(ScheduleRun.everyThreeHours(mins));
  }

  everyFourHours(mins: number = 0) {
    this.cron(ScheduleRun.everyFourHours(mins));
  }

  everySixHours(mins: number = 0) {
    this.cron(ScheduleRun.everySixHours(mins));
  }

  daily() {
    this.cron(ScheduleRun.daily);
  }

  dailyAt(time: string) {
    this.cron(ScheduleRun.dailyAt(time));
  }

  twiceDaily(hour1: number, hour2: number) {
    this.cron(ScheduleRun.twiceDaily(hour1, hour2));
  }

  twiceDailyAt(hour1: number, hour2: number, mins: number) {
    this.cron(ScheduleRun.twiceDailyAt(hour1, hour2, mins));
  }

  weekly() {
    this.cron(ScheduleRun.weekly);
  }

  weeklyOn(day: number, time: string) {
    this.cron(ScheduleRun.weeklyOn(day, time));
  }

  monthly() {
    this.cron(ScheduleRun.monthly);
  }

  monthlyOn(day: number, time: string) {
    this.cron(ScheduleRun.monthlyOn(day, time));
  }

  twiceMonthly(firstDay: number, secondDay: number, time: string) {
    this.cron(ScheduleRun.twiceMonthly(firstDay, secondDay, time));
  }

  lastDayOfMonth(time: string) {
    this.cron(ScheduleRun.lastDayOfMonth(time));
  }

  quarterly() {
    this.cron(ScheduleRun.quarterly);
  }

  quarterlyOn(day: number, time: string) {
    this.cron(ScheduleRun.quarterlyOn(day, time));
  }

  yearly() {
    this.cron(ScheduleRun.yearly);
  }

  yearlyOn(month: number, day: number, time: string) {
    this.cron(ScheduleRun.yearlyOn(month, day, time));
  }

  private makeCronJob() {
    this.scheduleName = this.scheduleName || `schedule_${ulid()}`;
    const onTick = async () => {
      try {
        console.log('running on tick ===> ');
        const beforeResult = this.beforeFunc && (await this.beforeFunc());
        console.log('before result ===> ', beforeResult);
        const { type, value } = this.handler;
        if (type === HandlerType.COMMAND) {
          await CommandRunner.run(value);
        } else if (type === HandlerType.FUNCTION) {
          await value();
        } else if (type === HandlerType.JOB) {
          await Dispatch(value);
        }

        console.log(this.handler);
        const afterResult = this.afterFunc && (await this.afterFunc());
        console.log('after result ===> ', beforeResult);
      } catch (e) {
        await this.onErrorFunc(e as Error);
      }
    };
    this.cronJob = CronJob.from({
      cronTime: this.cronExpression,
      onTick: onTick.bind(this),
      start: this.autoStart,
      timeZone: this.tz,
    });

    SchedulerRegistry.register(this.scheduleName, this);
  }

  /**
   * Getter methods
   */
  getCronExp(): string {
    return this.cronExpression;
  }

  getPurpose(): ScheduleOptions['purpose'] {
    return this.purposeText;
  }

  getName(): ScheduleOptions['name'] {
    return this.scheduleName;
  }

  /**
   * Lifecycle methods
   */
  stop() {
    this.cronJob.stop();
  }

  lastExecution(): Date {
    return this.cronJob.lastExecution;
  }

  before(fun: Function): this {
    this.beforeFunc = fun;
    return this;
  }

  after(fun: Function): this {
    this.afterFunc = fun;
    return this;
  }

  onError(fun: (e: Error) => void): this {
    this.onErrorFunc = fun;
    return this;
  }
}
