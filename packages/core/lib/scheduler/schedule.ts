import { CronJob } from 'cron';
import { Dispatch, Message } from '../queue/index.js';
import { SchedulerRegistry } from './metadata.js';
import { ulid } from 'ulid';
import {
  HandlerType,
  PingOptions,
  ScheduleHandler,
  ScheduleOptions,
} from './options/interface.js';
import { CommandRunner } from '../console/runner.js';
import { ScheduleFrequency } from './frequency.js';
import fs from 'fs-extra';
import execa from 'execa';
import { MailMessage } from '../mailer/message.js';
import { Mail } from '../mailer/mail.js';
import { ConfigService } from '../config/service.js';

const { appendFileSync, writeFileSync } = fs;

export class Schedule {
  static SUNDAY = '0';
  static MONDAY = '1';
  static TUESDAY = '2';
  static WEDNESDAY = '3';
  static THURSDAY = '4';
  static FRIDAY = '5';
  static SATURDAY = '6';

  private scheduleName: ScheduleOptions['name'];
  private purposeText: ScheduleOptions['purpose'];
  private handler: ScheduleHandler;
  private cronJob: CronJob;
  private tz: ScheduleOptions['timezone'];
  private cronExpression: string;
  private beforeFunc: any;
  private afterFunc: any;
  private autoStart: boolean | undefined;
  private whenFunc: (...args: any[]) => Promise<boolean> | boolean;
  private skipFunc: (...args: any[]) => Promise<boolean> | boolean;
  private onSuccessFunc: (...args: any[]) => Promise<void> | void;
  private onFailureFunc: (...args: any[]) => Promise<void> | void;
  private frequency: ScheduleFrequency;
  private pingBeforeOptions: PingOptions;
  private pingThenOptions: PingOptions;
  private pingOnSuccessOptions: PingOptions;
  private pingOnFailureOptions: PingOptions;
  private outputFileOptions: ScheduleOptions['outputFile'];
  private emailOutputToOptions: { email: string; onFailureOnly?: boolean }[];

  constructor(handler: ScheduleHandler) {
    this.purposeText = '';
    this.scheduleName = '';
    this.cronJob = null;
    this.cronExpression = '';
    this.handler = handler;
    this.frequency = new ScheduleFrequency();
    this.pingBeforeOptions = { url: undefined, ifCb: undefined };
    this.pingThenOptions = { url: undefined, ifCb: undefined };
    this.pingOnSuccessOptions = { url: undefined, ifCb: undefined };
    this.pingOnFailureOptions = { url: undefined, ifCb: undefined };
    this.outputFileOptions = { file: undefined };
    this.emailOutputToOptions = [];
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

  utcOffset(offset: string): this {
    return this;
  }

  cron(expression: string): this {
    this.frequency.cron(expression);
    return this;
  }

  at(time: string): this {
    this.frequency.dailyAt(time);
    return this;
  }

  everySecond(): this {
    this.frequency.everySecond();
    return this;
  }

  everyTwoSeconds(): this {
    this.frequency.everyTwoSeconds();
    return this;
  }

  everyFiveSeconds(): this {
    this.frequency.everyFiveSeconds();
    return this;
  }

  everyTenSeconds(): this {
    this.frequency.everyTenSeconds();
    return this;
  }

  everyFifteenSeconds(): this {
    this.frequency.everyFifteenSeconds();
    return this;
  }

  everyTwentySeconds(): this {
    this.frequency.everyTwentySeconds();
    return this;
  }

  everyThirtySeconds(): this {
    this.frequency.everyThirtySeconds();
    return this;
  }

  everyMinute(): this {
    this.frequency.everyMinute();
    return this;
  }

  everyTwoMinutes(): this {
    this.frequency.everyTwoMinutes();
    return this;
  }

  everyThreeMinutes(): this {
    this.frequency.everyThreeMinutes();
    return this;
  }

  everyFourMinutes(): this {
    this.frequency.everyFourMinutes();
    return this;
  }

  everyFiveMinutes(): this {
    this.frequency.everyFiveMinutes();
    return this;
  }

  everyTenMinutes(): this {
    this.frequency.everyTenMinutes();
    return this;
  }

  everyFifteenMinutes(): this {
    this.frequency.everyFifteenMinutes();
    return this;
  }

  everyThirtyMinutes(): this {
    this.frequency.everyThirtyMinutes();
    return this;
  }

  hourly(): this {
    this.frequency.hourly();
    return this;
  }

  hourlyAt(min: number): this {
    this.frequency.hourlyAt(min);
    return this;
  }

  everyOddHour(mins: number = 0): this {
    this.frequency.everyOddHour(mins);
    return this;
  }

  everyTwoHours(mins: number = 0): this {
    this.frequency.everyTwoHours(mins);
    return this;
  }

  everyThreeHours(mins: number = 0): this {
    this.frequency.everyThreeHours(mins);
    return this;
  }

  everyFourHours(mins: number = 0): this {
    this.frequency.everyFourHours(mins);
    return this;
  }

  everySixHours(mins: number = 0): this {
    this.frequency.everySixHours(mins);
    return this;
  }

  daily(): this {
    this.frequency.daily();
    return this;
  }

  dailyAt(time: string): this {
    this.frequency.dailyAt(time);
    return this;
  }

  twiceDaily(firstTime: string, secondTime: string): this {
    this.frequency.twiceDaily(firstTime, secondTime);
    return this;
  }

  twiceDailyAt(firstTime: string, secondTime: string): this {
    this.frequency.twiceDailyAt(firstTime, secondTime);
    return this;
  }

  weekly(): this {
    this.frequency.weekly();
    return this;
  }

  weeklyOn(day: number, time: string): this {
    this.frequency.weeklyOn(day, time);
    return this;
  }

  monthly(): this {
    this.frequency.monthly();
    return this;
  }

  monthlyOn(day: number, time: string): this {
    this.frequency.monthlyOn(day, time);
    return this;
  }

  twiceMonthly(firstDay: number, secondDay: number, time: string): this {
    this.frequency.twiceMonthly(firstDay, secondDay, time);
    return this;
  }

  lastDayOfMonth(time: string): this {
    this.frequency.lastDayOfMonth(time);
    return this;
  }

  quarterly(time: string): this {
    this.frequency.quarterly(time);
    return this;
  }

  quarterlyOn(day: number, time: string): this {
    this.frequency.quarterlyOn(day, time);
    return this;
  }

  yearly(): this {
    this.frequency.yearly();
    return this;
  }

  yearlyOn(month: number, day: number, time: string): this {
    this.frequency.yearlyOn(month, day, time);
    return this;
  }

  weekdays(): this {
    this.frequency.weekdays();
    return this;
  }

  weekends(): this {
    this.frequency.weekends();
    return this;
  }

  sundays(): this {
    this.frequency.sundays();
    return this;
  }

  mondays(): this {
    this.frequency.mondays();
    return this;
  }

  tuesdays(): this {
    this.frequency.tuesdays();
    return this;
  }

  wednesdays(): this {
    this.frequency.wednesdays();
    return this;
  }

  thursdays(): this {
    this.frequency.thursdays();
    return this;
  }

  fridays(): this {
    this.frequency.fridays();
    return this;
  }

  saturdays(): this {
    this.frequency.saturdays();
    return this;
  }

  between(startTime: string, endTime: string): this {
    this.frequency.between(startTime, endTime);
    return this;
  }

  days(days: string[]): this {
    this.frequency.days(days);
    return this;
  }

  run() {
    this.makeCronJob();
  }

  private makeCronJob() {
    this.scheduleName = this.scheduleName || `schedule_${ulid()}`;
    this.cronExpression = this.frequency.build();
    const autoStart =
      ConfigService.get('app.schedules.runInAnotherThread') || false;

    const timezone =
      this.tz ?? (ConfigService.get('app.schedules.timezone') as string);

    this.cronJob = CronJob.from({
      cronTime: this.cronExpression,
      onTick: this.composeHandler.bind(this),
      start: !autoStart,
      timeZone: timezone,
    });

    SchedulerRegistry.register(this.scheduleName, this);
  }

  async composeHandler() {
    let output = null;
    const startedAt = this.formatDate(new Date());
    const startedAtEpoch = performance.now();

    try {
      if (this.whenFunc) {
        const shouldRun = await this.whenFunc();
        if (!shouldRun) return;
      }

      if (this.skipFunc) {
        const shouldSkip = await this.skipFunc();
        if (shouldSkip) return;
      }

      const beforeResult = await this.processBeforeEvents({ startedAt });

      const { type, value } = this.handler;
      if (type === HandlerType.COMMAND) {
        output = await CommandRunner.run(value);
      } else if (type === HandlerType.FUNCTION) {
        output = await value(beforeResult);
      } else if (type === HandlerType.JOB) {
        output = await Dispatch(value);
      } else if (type === HandlerType.SHELL) {
        const command = value.split(' ');
        const { stdout, stderr, exitCode } = await execa(
          command[0],
          command.slice(1),
          { stdio: 'pipe' },
        );
        if (exitCode !== 0) throw new Error(stderr);
        output = stdout;
      }

      await this.sendEmail(output);

      await this.processAfterEvents(output, {
        startedAtEpoch: startedAtEpoch,
        startedAt,
      });
    } catch (e) {
      console.error('error ===> ', e);
      await this.sendEmail(output, e as Error);
      await this.processFailureEvents(e as Error, output);
      return;
    }

    await this.processSuccessEvents(output, {
      startedAtEpoch: startedAtEpoch,
      startedAt,
    });
  }

  async processBeforeEvents(options: { startedAt: string }): Promise<any> {
    const beforeResult = this.beforeFunc && (await this.beforeFunc());
    if (!this.pingBeforeOptions.url) return beforeResult;

    const shouldPing = this.pingBeforeOptions.ifCb
      ? await this.pingBeforeOptions.ifCb()
      : true;

    if (!shouldPing) return beforeResult;

    const payload = {
      event: 'before',
      scheduleName: this.scheduleName,
      cronExpression: this.cronExpression,
      purpose: this.purposeText,
      timezone: this.tz,
      startedAt: options.startedAt,
    };
    await fetch(this.pingBeforeOptions.url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async processAfterEvents(
    result: any,
    options: { startedAtEpoch: number; startedAt: string },
  ) {
    this.writeOutputToFile(result);
    const afterResult = this.afterFunc && (await this.afterFunc(result));

    if (!this.pingThenOptions.url) return afterResult;

    const shouldPingThen = this.pingThenOptions.ifCb
      ? await this.pingThenOptions.ifCb()
      : true;

    if (!shouldPingThen) return;

    const payload = {
      event: 'after',
      scheduleName: this.scheduleName,
      cronExpression: this.cronExpression,
      startedAt: options.startedAt,
    };

    try {
      await fetch(this.pingThenOptions.url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async processSuccessEvents(
    output: any,
    options: { startedAtEpoch: number; startedAt: string },
  ): Promise<void> {
    this.onSuccessFunc && (await this.onSuccessFunc(output));

    if (!this.pingOnSuccessOptions.url) return;

    const shouldPingSuccess = this.pingOnSuccessOptions.ifCb
      ? await this.pingOnSuccessOptions.ifCb()
      : true;

    if (!shouldPingSuccess) return;

    const payload = {
      totalTimeInMs: performance.now() - options.startedAtEpoch,
      event: 'success',
      scheduleName: this.scheduleName,
      cronExpression: this.cronExpression,
      startedAt: this.formatDate(new Date()),
    };

    try {
      await fetch(this.pingOnSuccessOptions.url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async processFailureEvents(error: Error, result: any): Promise<void> {
    this.onFailureFunc && (await this.onFailureFunc(error));
    this.writeOutputToFile(result, error);

    if (!this.pingOnFailureOptions.url) return;

    const shouldPingFailure = this.pingOnFailureOptions.ifCb
      ? await this.pingOnFailureOptions.ifCb()
      : true;

    if (!shouldPingFailure) return;

    const payload = {
      scheduleName: this.scheduleName,
      cronExpression: this.cronExpression,
      event: 'failure',
    };

    try {
      await fetch(this.pingOnFailureOptions.url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error(e);
    }
  }

  writeOutputToFile(result: any, error?: Error): void {
    if (!this.outputFileOptions.file) {
      return;
    }

    const content = {
      event: error ? 'failure' : 'success',
      date: this.formatDate(new Date()),
      error: error?.message,
      stack: error?.stack,
      result,
    };
    if (this.outputFileOptions.append) {
      appendFileSync(
        this.outputFileOptions.file,
        JSON.stringify(content) + '\n',
      );
      return;
    }

    writeFileSync(this.outputFileOptions.file, JSON.stringify(content) + '\n');
  }

  async sendEmail(output: string, error?: Error): Promise<void> {
    if (!this.emailOutputToOptions.length) return;

    const subject = `Output from scheduled task: ${this.scheduleName}`;
    const content = {
      name: this.scheduleName,
      schedule: this.cronExpression,
      purpose: this.purposeText,
      timezone: this.tz,
      startedAt: this.formatDate(new Date()),
      result: output,
      error: error?.message,
      stack: error?.stack,
      status: error ? 'failure' : 'success',
    };

    const mail = MailMessage.init()
      .preview(subject)
      .subject(subject)
      .raw(JSON.stringify(content));

    const emails = error
      ? this.emailOutputToOptions.filter(o => o.onFailureOnly).map(o => o.email)
      : this.emailOutputToOptions.map(o => o.email);

    emails.length && (await Mail.init().to(emails).send(mail));
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

  start() {
    this.cronJob.start();
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

  onFailure(fun: (e: Error) => void): this {
    this.onFailureFunc = fun;
    return this;
  }

  onSuccess(fun: (...args: any[]) => void): this {
    this.onSuccessFunc = fun;
    return this;
  }

  pingBefore(url: string): this {
    this.pingBeforeOptions = { url, ifCb: undefined };
    return this;
  }

  pingBeforeIf(
    cb: (...args: any[]) => Promise<boolean> | boolean,
    url: string,
  ): this {
    this.pingBeforeOptions.ifCb = cb;
    this.pingBeforeOptions.url = url;
    return this;
  }

  thenPing(url: string): this {
    this.pingThenOptions = { url, ifCb: undefined };
    return this;
  }

  thenPingIf(
    cb: (...args: any[]) => Promise<boolean> | boolean,
    url: string,
  ): this {
    this.pingThenOptions.ifCb = cb;
    this.pingThenOptions.url = url;
    return this;
  }

  onSuccessPing(url: string): this {
    this.pingOnSuccessOptions = { url, ifCb: undefined };
    return this;
  }

  pingOnSuccess(url: string): this {
    this.pingOnSuccessOptions = { url, ifCb: undefined };
    return this;
  }

  pingOnSuccessIf(
    cb: (...args: any[]) => Promise<boolean> | boolean,
    url: string,
  ): this {
    this.pingOnSuccessOptions.ifCb = cb;
    this.pingOnSuccessOptions.url = url;
    return this;
  }

  pingOnFailure(url: string): this {
    this.pingOnFailureOptions = { url, ifCb: undefined };
    return this;
  }

  pingOnFailureIf(
    cb: (...args: any[]) => Promise<boolean> | boolean,
    url: string,
  ): this {
    this.pingOnFailureOptions.ifCb = cb;
    this.pingOnFailureOptions.url = url;
    return this;
  }

  sendOutputToFile(file: string, append: boolean = false): this {
    this.outputFileOptions = { file, append };
    return this;
  }

  appendOutputToFile(file: string): this {
    this.outputFileOptions = { file, append: true };
    return this;
  }

  emailOutputTo(...emails: string[]): this {
    this.emailOutputToOptions.push(
      ...emails.map(email => ({ email, onFailureOnly: false })),
    );
    return this;
  }

  emailOutputOnFailure(...emails: string[]): this {
    this.emailOutputToOptions.push(
      ...emails.map(email => ({ email, onFailureOnly: true })),
    );
    return this;
  }

  when(cb: (...args: any[]) => Promise<boolean> | boolean): this {
    this.whenFunc = cb;
    return this;
  }

  skip(cb: (...args: any[]) => Promise<boolean> | boolean): this {
    this.skipFunc = cb;
    return this;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: this.tz ? this.tz : 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
