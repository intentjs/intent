type CronField = '*' | string;

export class ScheduleFrequency {
  static SUNDAY = '0';
  static MONDAY = '1';
  static TUESDAY = '2';
  static WEDNESDAY = '3';
  static THURSDAY = '4';
  static FRIDAY = '5';
  static SATURDAY = '6';

  private second: CronField[] = [];
  private minute: CronField[] = [];
  private hour: CronField[] = [];
  private dayOfMonth: CronField[] = [];
  private month: CronField[] = [];
  private dayOfWeek: CronField[] = [];

  private weeklyEnabled = false;

  everySecond(): this {
    this.second.push('*');
    return this;
  }

  everyTwoSeconds(): this {
    this.second.push('*/2');
    return this;
  }

  everyFiveSeconds(): this {
    this.second.push('*/5');
    return this;
  }

  everyTenSeconds(): this {
    this.second.push('*/10');
    return this;
  }

  everyFifteenSeconds(): this {
    this.second.push('*/15');
    return this;
  }

  everyTwentySeconds(): this {
    this.second.push('*/20');
    return this;
  }

  everyThirtySeconds(): this {
    this.second.push('*/30');
    return this;
  }

  everyMinute(): this {
    this.second = ['0'];
    this.minute.push('*');
    return this;
  }

  everyTwoMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/2');
    return this;
  }

  everyThreeMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/3');
    return this;
  }

  everyFourMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/4');
    return this;
  }

  everyFiveMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/5');
    return this;
  }

  everyTenMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/10');
    return this;
  }

  everyFifteenMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/15');
    return this;
  }

  everyThirtyMinutes(): this {
    this.second = ['0'];
    this.minute.push('*/30');
    return this;
  }

  weekdays(): this {
    this.dayOfWeek.push(
      `${ScheduleFrequency.MONDAY}-${ScheduleFrequency.FRIDAY}`,
    );
    return this;
  }

  weekends(): this {
    this.dayOfWeek.push(
      `${ScheduleFrequency.SATURDAY},${ScheduleFrequency.SUNDAY}`,
    );
    return this;
  }

  sundays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.SUNDAY);
    return this;
  }

  mondays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.MONDAY);
    return this;
  }

  tuesdays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.TUESDAY);
    return this;
  }

  wednesdays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.WEDNESDAY);
    return this;
  }

  thursdays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.THURSDAY);
    return this;
  }

  fridays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.FRIDAY);
    return this;
  }

  saturdays(): this {
    if (this.weeklyEnabled) this.dayOfWeek = [];
    this.dayOfWeek.push(ScheduleFrequency.SATURDAY);
    return this;
  }

  cron(expr: string): this {
    this.reset();

    const parts = expr.trim().split(/\s+/);
    if (parts.length === 6) {
      const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      this.second = second === '*' ? [] : second.split(',');
      this.minute = minute === '*' ? [] : minute.split(',');
      this.hour = hour === '*' ? [] : hour.split(',');
      this.dayOfMonth = dayOfMonth === '*' ? [] : dayOfMonth.split(',');
      this.month = month === '*' ? [] : month.split(',');
      this.dayOfWeek = dayOfWeek === '*' ? [] : dayOfWeek.split(',');
    } else if (parts.length === 5) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      this.second = ['0'];
      this.minute = minute === '*' ? [] : minute.split(',');
      this.hour = hour === '*' ? [] : hour.split(',');
      this.dayOfMonth = dayOfMonth === '*' ? [] : dayOfMonth.split(',');
      this.month = month === '*' ? [] : month.split(',');
      this.dayOfWeek = dayOfWeek === '*' ? [] : dayOfWeek.split(',');
    } else {
      throw new Error(
        'Invalid cron expression format. Use 5 or 6 space-separated parts.',
      );
    }
    return this;
  }

  build(): string {
    const formatPart = (part: CronField[]) =>
      part.length === 0 ? '*' : part.join(',');

    return [
      formatPart(this.second),
      formatPart(this.minute),
      formatPart(this.hour),
      formatPart(this.dayOfMonth),
      formatPart(this.month),
      formatPart(this.dayOfWeek),
    ].join(' ');
  }

  reset(): this {
    this.second = [];
    this.minute = [];
    this.hour = [];
    this.dayOfMonth = [];
    this.month = [];
    this.dayOfWeek = [];
    return this;
  }

  toJSON() {
    return {
      second: this.second,
      minute: this.minute,
      hour: this.hour,
      dayOfMonth: this.dayOfMonth,
      month: this.month,
      dayOfWeek: this.dayOfWeek,
    };
  }

  hourly(): this {
    this.second = ['0'];
    this.minute = ['0'];
    this.hour = ['*'];
    return this;
  }

  hourlyAt(min: number): this {
    this.second = ['0'];
    this.minute = [String(min)];
    return this;
  }

  everyOddHour(minute: string | number = '0'): this {
    this.second = ['0'];
    this.minute = [String(minute)];
    this.hour = ['1-23/2'];
    return this;
  }

  everyTwoHours(minute: string | number = '0'): this {
    this.second = ['0'];
    this.minute = [String(minute)];
    this.hour = ['*/2'];
    return this;
  }

  everyThreeHours(minute: string | number = '0'): this {
    this.second = ['0'];
    this.minute = [String(minute)];
    this.hour = ['*/3'];
    return this;
  }

  everyFourHours(minute: string | number = '0'): this {
    this.second = ['0'];
    this.minute = [String(minute)];
    this.hour = ['*/4'];
    return this;
  }

  everyFiveHours(minute: string | number = '0'): this {
    this.second = ['0'];
    this.minute = [String(minute)];
    this.hour = ['*/5'];
    return this;
  }

  everySixHours(minute: string | number = '0'): this {
    this.second = ['0'];
    this.minute = [String(minute)];
    this.hour = ['*/6'];
    return this;
  }

  /**
   * Schedule the task to run daily at midnight.
   */
  daily(): this {
    this.second = ['0'];
    this.minute = ['0'];
    this.hour = ['0'];
    this.dayOfMonth = ['*'];
    this.month = ['*'];
    return this;
  }

  dailyAt(time: string): this {
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  twiceDaily(firstTime: string, secondTime: string): this {
    const [firstHour, firstMinute] = firstTime.split(':').map(Number);
    const [secondHour, secondMinute] = secondTime.split(':').map(Number);
    this.hour = [String(firstHour), String(secondHour)];
    this.minute = [String(firstMinute), String(secondMinute)];
    return this;
  }

  twiceDailyAt(firstTime: string, secondTime: string): this {
    const [firstHour, firstMinute] = firstTime.split(':').map(Number);
    const [secondHour, secondMinute] = secondTime.split(':').map(Number);
    this.hour = [String(firstHour), String(secondHour)];
    this.minute = [String(firstMinute), String(secondMinute)];
    return this;
  }

  /**
   * Schedule the task to run weekly on Sunday at 00:00.
   */
  weekly(): this {
    this.dayOfWeek = [ScheduleFrequency.SUNDAY];
    this.weeklyEnabled = true;
    return this;
  }

  /**
   * Schedule the task to run weekly on a specific day at a specific time.
   */
  weeklyOn(day: number | number[], time: string): this {
    this.dayOfWeek = Array.isArray(day) ? day.map(String) : [String(day)];
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  monthly(): this {
    this.dayOfMonth = ['1'];
    return this;
  }

  monthlyOn(day: number, time: string): this {
    this.dayOfMonth = [String(day)];
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  twiceMonthly(firstDay: number, secondDay: number, time: string): this {
    this.dayOfMonth = [String(firstDay), String(secondDay)];
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  lastDayOfMonth(time: string): this {
    this.dayOfMonth = ['L'];
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  quarterly(time: string): this {
    this.month = ['1', '4', '7', '10'];
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  quarterlyOn(day: number, time: string): this {
    this.month = ['1', '4', '7', '10'];
    this.dayOfMonth = [String(day)];
    const [hour, minute] = time.split(':').map(Number);
    this.hour = [String(hour)];
    this.minute = [String(minute)];
    return this;
  }

  /**
   * Schedule the task to run on the first day of every year at 00:00.
   */
  yearly(): this {
    this.dayOfMonth.push('1');
    this.month.push('1');
    return this;
  }

  yearlyOn(month: number, day: number, time: string): this {
    this.dayOfMonth.push(String(day));
    this.month.push(String(month));
    const [hour, minute] = time.split(':').map(Number);
    this.hour.push(String(hour));
    this.minute.push(String(minute));
    return this;
  }

  /**
   * Set the seconds field of the cron expression.
   * @param value The cron value for seconds ('*', '0-59', '*\/15', etc.).
   */
  seconds(value: CronField): this {
    this.second.push(value);
    return this;
  }

  /**
   * Set the minutes field of the cron expression.
   * @param value The cron value for minutes ('*', '0-59', '*\/15', '1,15,30', etc.).
   */
  minutes(value: CronField): this {
    this.minute.push(value);
    return this;
  }

  /**
   * Set the day of the month field of the cron expression.
   * @param value The cron value for day of month ('*', '1-31', 'L', '1,15', etc.).
   */
  daysOfMonth(value: CronField): this {
    this.dayOfMonth.push(value);
    return this;
  }

  /**
   * Set the months field of the cron expression.
   * @param value The cron value for months ('*', '1-12', '*\/3', '1,6,12', etc.).
   */
  months(value: CronField): this {
    this.month.push(value);
    return this;
  }

  /**
   * Set the days of the week field of the cron expression.
   * @param value The cron value for day of week ('*', '0-6', '1-5', 'MON,WED,FRI', etc.).
   */
  days(value: Array<number | string>): this {
    this.dayOfWeek.push(...value.map(String));
    return this;
  }

  /**
   * Restrict the task to run only between the given start and end times (inclusive).
   * Sets the hour range based on the times. Defaults minute to '*' and second to '0'
   * if they haven't been set by other methods.
   * Note: Minute precision within the start/end time (e.g., ending at :24)
   * is not supported by standard cron ranges and will be ignored. The range applies to whole hours.
   * @param startTime Start time in HH:MM format.
   * @param endTime End time in HH:MM format.
   */
  between(startTime: string, endTime: string): this {
    const [startHourStr] = startTime.split(':');
    const [endHourStr] = endTime.split(':');

    const startHour = parseInt(startHourStr, 10);
    const endHour = parseInt(endHourStr, 10);

    if (
      isNaN(startHour) ||
      isNaN(endHour) ||
      startHour < 0 ||
      startHour > 23 ||
      endHour < 0 ||
      endHour > 23
    ) {
      throw new Error('Invalid hour values in between(). Hours must be 0-23.');
    }

    if (startHour > endHour) {
      console.warn(
        'Warning: between() with start hour > end hour might not produce expected cron range.',
      );
      this.hour = [`${startHour}-23`, `0-${endHour}`];
    } else {
      this.hour = [`${startHour}-${endHour}`];
    }

    if (this.minute.length === 0) this.minute = [];
    if (this.second.length === 0) this.second = ['0'];
    return this;
  }
}
